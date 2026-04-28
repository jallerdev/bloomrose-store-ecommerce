import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { Lock, ExternalLink, AlertTriangle } from "lucide-react";
import { buildCheckoutUrl } from "@/lib/wompi";

export const metadata = { title: "Pago — Bloom Rose" };
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.profileId !== user.id) notFound();

  // Si ya está pagado, ir a confirmación
  if (order.status !== "PENDING") {
    redirect(`/perfil/pedidos/${order.id}`);
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Construir URL de Wompi. Si faltan credenciales, mostramos un fallback.
  let checkoutUrl: string | null = null;
  let configError: string | null = null;
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    checkoutUrl = buildCheckoutUrl({
      reference: order.paymentReference!,
      amountCop: Number(order.totalAmount),
      redirectUrl: `${baseUrl}/perfil/pedidos/${order.id}`,
      customerEmail: profile?.email ?? user.email ?? undefined,
      customerFullName: order.shippingFullName ?? undefined,
      customerPhone: order.shippingPhone ?? undefined,
    });
  } catch (err) {
    configError = err instanceof Error ? err.message : "Error de configuración";
  }

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground">Confirmación de pago</h1>
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
              <span>Total a pagar</span>
              <span>{fmt(Number(order.totalAmount))}</span>
            </div>
          </div>

          <div className="mt-8">
            {configError ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-8 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  La pasarela no está configurada todavía.
                </p>
                <p className="text-xs text-muted-foreground">
                  Falta {configError}. Tu pedido está creado en estado PENDIENTE.
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
                  Aceptamos tarjetas, PSE, Nequi y Bancolombia. Volverás aquí al
                  finalizar.
                </p>
              </>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/perfil/pedidos"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Pagar más tarde · Ver mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
