import Link from "next/link";
import { db } from "@/lib/db";
import { orders, profiles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "Pedidos — Admin" };
export const dynamic = "force-dynamic";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default async function AdminPedidosPage() {
  const allOrders = await db
    .select({
      id: orders.id,
      paymentReference: orders.paymentReference,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      shippingCity: orders.shippingCity,
      customerEmail: profiles.email,
      customerFirstName: profiles.firstName,
      customerLastName: profiles.lastName,
    })
    .from(orders)
    .leftJoin(profiles, eq(orders.profileId, profiles.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {allOrders.length} pedidos en total.
        </p>
      </div>

      {allOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Aún no hay pedidos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Referencia</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Ciudad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {allOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-mono text-xs text-foreground hover:text-primary"
                    >
                      {o.paymentReference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="flex flex-col">
                      <span>
                        {[o.customerFirstName, o.customerLastName]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.shippingCity ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {fmt(Number(o.totalAmount))}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      aria-label="Ver detalle"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
