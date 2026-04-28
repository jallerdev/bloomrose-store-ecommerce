import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  profiles,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Separator } from "@/components/ui/separator";
import { OrderAdminControls } from "./OrderAdminControls";

export const metadata = { title: "Detalle de pedido — Admin" };
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

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) notFound();

  const [profile] = order.profileId
    ? await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, order.profileId))
        .limit(1)
    : [];

  const items = await db
    .select({
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      sku: productVariants.sku,
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
    <div>
      <div className="mb-6">
        <Link
          href="/admin/pedidos"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Volver a pedidos
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">
            <span className="font-mono text-sm">{order.paymentReference}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Creado{" "}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
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
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
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
                      <span className="font-medium text-foreground">
                        {it.productTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        SKU: {it.sku}
                        {it.variantName ? ` · ${it.variantName}` : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {it.quantity} × {fmt(Number(it.priceAtPurchase))}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {fmt(lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <Separator className="my-5" />
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
              <div className="flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{fmt(Number(order.totalAmount))}</span>
              </div>
            </div>
          </section>

          {/* Cliente + envío */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 font-serif text-lg text-foreground">
              Cliente
            </h2>
            <p className="text-sm text-foreground">
              {[profile?.firstName, profile?.lastName]
                .filter(Boolean)
                .join(" ") || "—"}
            </p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
            {profile?.phone && (
              <p className="text-xs text-muted-foreground">{profile.phone}</p>
            )}

            <Separator className="my-4" />

            <h2 className="mb-3 font-serif text-lg text-foreground">
              Dirección de envío
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

            {order.notes && (
              <>
                <Separator className="my-4" />
                <h2 className="mb-2 font-serif text-lg text-foreground">
                  Notas
                </h2>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </>
            )}
          </section>
        </div>

        {/* Controles admin */}
        <aside>
          <OrderAdminControls
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={order.trackingNumber}
            shippingCarrier={order.shippingCarrier}
          />
        </aside>
      </div>
    </div>
  );
}
