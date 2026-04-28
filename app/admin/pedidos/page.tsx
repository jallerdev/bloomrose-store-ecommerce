import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { db } from "@/lib/db";
import { orders, profiles } from "@/lib/db/schema";
import { desc, eq, ilike, or, and, sql } from "drizzle-orm";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { TableSearch } from "@/components/admin/TableSearch";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pedidos — Admin Bloomrose" };
export const dynamic = "force-dynamic";

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagados" },
  { value: "PROCESSING", label: "Preparando" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
] as const;

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status;

  // Conteos por estado para los chips
  const counts = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .groupBy(orders.status);

  const countMap = new Map<string, number>(
    counts.map((c) => [c.status, Number(c.count)]),
  );
  const totalAll = counts.reduce((acc, c) => acc + Number(c.count), 0);

  const conditions = [];
  if (
    status &&
    STATUS_FILTERS.some((f) => f.value === status && f.value !== "all")
  ) {
    conditions.push(eq(orders.status, status as OrderStatus));
  }
  if (q) {
    conditions.push(
      or(
        ilike(orders.paymentReference, `%${q}%`),
        ilike(profiles.email, `%${q}%`),
        ilike(profiles.firstName, `%${q}%`),
        ilike(profiles.lastName, `%${q}%`),
        ilike(orders.shippingCity, `%${q}%`),
      )!,
    );
  }
  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

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
    .where(whereClause)
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allOrders.length} de {totalAll} pedidos
          {status && status !== "all" ? ` · filtro activo` : ""}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const isActive =
              (f.value === "all" && !status) || status === f.value;
            const c =
              f.value === "all" ? totalAll : countMap.get(f.value) ?? 0;
            const params = new URLSearchParams();
            if (f.value !== "all") params.set("status", f.value);
            if (q) params.set("q", q);
            return (
              <Link
                key={f.value}
                href={`/admin/pedidos${params.toString() ? `?${params.toString()}` : ""}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums",
                    isActive
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {c}
                </span>
              </Link>
            );
          })}
        </div>
        <TableSearch placeholder="Referencia, cliente o ciudad..." />
      </div>

      {allOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {q || status
              ? "No hay pedidos con esos filtros."
              : "Aún no hay pedidos."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <Th>Referencia</Th>
                <Th>Cliente</Th>
                <Th className="hidden md:table-cell">Ciudad</Th>
                <Th>Estado</Th>
                <Th className="text-right">Total</Th>
                <Th className="hidden lg:table-cell">Fecha</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allOrders.map((o) => (
                <tr
                  key={o.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-mono text-xs text-foreground transition-colors hover:text-primary"
                    >
                      {o.paymentReference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {[o.customerFirstName, o.customerLastName]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {o.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {o.shippingCity ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">
                    {fmtCOP(Number(o.totalAmount))}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {new Date(o.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      aria-label="Ver detalle"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
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

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
