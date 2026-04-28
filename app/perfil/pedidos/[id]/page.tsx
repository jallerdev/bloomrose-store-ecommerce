import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  productVariants,
  products,
  productImages,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Truck } from "lucide-react";

export const metadata = { title: "Detalle de pedido — Bloomrose" };
export const dynamic = "force-dynamic";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetallePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order || order.profileId !== user.id) notFound();

  const items = await db
    .select({
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      variantName: productVariants.name,
      productTitle: products.title,
      productSlug: products.slug,
      productId: products.id,
    })
    .from(orderItems)
    .innerJoin(
      productVariants,
      eq(orderItems.productVariantId, productVariants.id),
    )
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  const productIds = items.map((i) => i.productId);
  const imgRows = productIds.length
    ? await db
        .select()
        .from(productImages)
        .where(eq(productImages.displayOrder, 0))
    : [];
  const imageByProduct = new Map(
    imgRows
      .filter((i) => productIds.includes(i.productId))
      .map((i) => [i.productId, i.url]),
  );

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/perfil/pedidos"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Volver a mis pedidos
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-foreground">
              Pedido{" "}
              <span className="font-mono text-base">
                {order.paymentReference}
              </span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.status === "PENDING" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Tu pedido está pendiente de pago.
            </p>
            <Button asChild size="sm">
              <Link href={`/checkout/pago/${order.id}`}>Completar pago</Link>
            </Button>
          </div>
        )}

        {order.trackingNumber && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Truck className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {order.shippingCarrier} · Número de guía
              </p>
              <p className="font-mono text-sm text-foreground">
                {order.trackingNumber}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-serif text-lg text-foreground">
              Productos
            </h2>
            <ul className="flex flex-col gap-4">
              {items.map((it, idx) => {
                const img = imageByProduct.get(it.productId);
                const lineTotal = Number(it.priceAtPurchase) * it.quantity;
                return (
                  <li key={idx} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      {img && (
                        <Image
                          src={img}
                          alt={it.productTitle}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col text-sm">
                      <Link
                        href={`/productos/${it.productSlug}`}
                        className="line-clamp-2 font-medium text-foreground hover:text-primary"
                      >
                        {it.productTitle}
                      </Link>
                      {it.variantName && (
                        <span className="text-xs text-muted-foreground">
                          {it.variantName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Cantidad: {it.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {fmt(lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Resumen + dirección */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-serif text-lg text-foreground">
                Resumen
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{fmt(Number(order.subtotal))}</span>
                </div>
                {Number(order.discountTotal) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento</span>
                    <span>-{fmt(Number(order.discountTotal))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{fmt(Number(order.shippingCost))}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{fmt(Number(order.totalAmount))}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 font-serif text-lg text-foreground">
                Envío
              </h2>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  {order.shippingFullName}
                </p>
                <p>{order.shippingPhone}</p>
                <p className="mt-2">
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2
                    ? `, ${order.shippingAddressLine2}`
                    : ""}
                </p>
                <p>
                  {order.shippingCity}, {order.shippingDepartment}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
