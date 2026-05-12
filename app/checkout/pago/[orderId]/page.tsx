import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  productVariants,
  products,
  profiles,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { Lock, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { buildCheckoutUrl } from "@/lib/wompi";
import { PurchaseTracker } from "@/components/PurchaseTracker";

export const metadata = { title: "Pago · Bloom Rose" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderId: string }>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default async function PagoPage({ params }: Props) {
  const { orderId } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) notFound();

  // Autorización para acceder a esta página de pago:
  //   - Usuario logueado y dueño del pedido → OK
  //   - Pedido sin profileId (guest) → cualquiera con el link puede ver el resumen
  //     y completar el pago (el orderId es UUID, suficientemente difícil de adivinar).
  //   - Otros casos → 404
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user && order.profileId === user.id;
  const isGuestOrder = order.profileId === null;
  if (!isOwner && !isGuestOrder) notFound();

  // Email para Wompi: del perfil si está logueado, o del guestEmail si no.
  let customerEmail: string | undefined;
  if (user) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);
    customerEmail = profile?.email ?? user.email ?? undefined;
  } else {
    customerEmail = order.guestEmail ?? undefined;
  }

  // Si ya está pagado, mostramos confirmación en lugar del botón de pago.
  const alreadyPaid = order.status !== "PENDING" && order.status !== "CANCELLED";

  // Para tracking de compra (GA4 / Meta Pixel) cargamos los items sólo cuando se pagó.
  const purchaseItems = alreadyPaid
    ? await db
        .select({
          id: orderItems.productVariantId,
          name: products.title,
          variantName: productVariants.name,
          price: orderItems.priceAtPurchase,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .innerJoin(
          productVariants,
          eq(orderItems.productVariantId, productVariants.id),
        )
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(eq(orderItems.orderId, order.id))
    : [];

  // Construir URL de Wompi. Si faltan credenciales, mostramos un fallback.
  let checkoutUrl: string | null = null;
  let configError: string | null = null;
  if (!alreadyPaid) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      checkoutUrl = buildCheckoutUrl({
        reference: order.paymentReference!,
        amountCop: Number(order.totalAmount),
        redirectUrl: `${baseUrl}/checkout/pago/${order.id}`,
        customerEmail,
        customerFullName: order.shippingFullName ?? undefined,
        customerPhone: order.shippingPhone ?? undefined,
      });
    } catch (err) {
      configError =
        err instanceof Error ? err.message : "Error de configuración";
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground">
            {alreadyPaid ? "¡Pedido confirmado!" : "Confirmación de pago"}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Procesado de forma segura por Wompi
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedido</span>
              <span className="font-mono text-xs text-foreground">
                {order.paymentReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{fmt(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{fmt(Number(order.shippingCost))}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-medium">
              <span>{alreadyPaid ? "Total pagado" : "Total a pagar"}</span>
              <span>{fmt(Number(order.totalAmount))}</span>
            </div>
          </div>

          <div className="mt-8">
            {alreadyPaid ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-8 text-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <p className="text-sm font-medium text-foreground">
                  Recibimos tu pago. Te enviamos la confirmación por correo.
                </p>
                <p className="text-xs text-muted-foreground">
                  Ya estamos preparando tu pedido con cariño.
                </p>
                <PurchaseTracker
                  transactionId={order.paymentReference ?? order.id}
                  value={Number(order.totalAmount)}
                  shipping={Number(order.shippingCost)}
                  coupon={order.couponCode ?? undefined}
                  items={purchaseItems.map((i) => ({
                    item_id: i.id,
                    item_name: i.name,
                    item_variant: i.variantName ?? undefined,
                    price: Number(i.price),
                    quantity: i.quantity,
                  }))}
                />
              </div>
            ) : configError ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-8 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  La pasarela no está configurada todavía.
                </p>
                <p className="text-xs text-muted-foreground">
                  Falta {configError}. Tu pedido está creado en estado
                  PENDIENTE.
                </p>
              </div>
            ) : (
              <>
                <Button
                  asChild
                  className="w-full rounded-xl bg-foreground py-6 text-base text-background hover:bg-foreground/90"
                >
                  <a href={checkoutUrl!}>
                    Pagar con Wompi
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Aceptamos tarjetas, PSE, Nequi y Bancolombia. Volverás aquí
                  al finalizar.
                </p>
              </>
            )}

            <div className="mt-4 text-center">
              {user ? (
                <Link
                  href="/perfil/pedidos"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ver mis pedidos
                </Link>
              ) : (
                <Link
                  href="/productos"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Seguir comprando
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
