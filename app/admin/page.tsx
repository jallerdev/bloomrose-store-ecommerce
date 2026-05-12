import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  categories,
  orders,
  productVariants,
  products,
  profiles,
} from "@/lib/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lt,
  lte,
  sql,
  sum,
} from "drizzle-orm";

import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { SalesChart } from "@/components/admin/SalesChart";

export const metadata = { title: "Dashboard — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const fmtNumber = (n: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);

export default async function AdminDashboardPage() {
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 29);
  start30.setHours(0, 0, 0, 0);

  const start60 = new Date(now);
  start60.setDate(start60.getDate() - 59);
  start60.setHours(0, 0, 0, 0);

  // Filtro de "ventas reales" — lista positiva en vez de doble `<>` para que
  // Postgres pueda usar el índice (status, created_at). El predicado `<>`
  // no es selectivo y forzaba seq scan, llegando al statement_timeout del
  // pooler de Supabase.
  const realSale = inArray(orders.status, [
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ]);

  // KPIs — Promise.allSettled para que el dashboard no se rompa entero si una
  // query individual hace timeout en el pooler de Supabase. Cada KPI tiene un
  // fallback razonable.
  const settled = await Promise.allSettled([
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(orders),
    db.select({ count: count() }).from(profiles),
    db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(and(realSale, gte(orders.createdAt, start30))),
    db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(
        and(
          realSale,
          gte(orders.createdAt, start60),
          lt(orders.createdAt, start30),
        ),
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(and(realSale, gte(orders.createdAt, start30))),
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          realSale,
          gte(orders.createdAt, start60),
          lt(orders.createdAt, start30),
        ),
      ),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pick = <T,>(idx: number, fallback: T): T => {
    const r = settled[idx];
    if (r.status === "fulfilled") return r.value as unknown as T;
    console.warn(`[admin.kpi] query ${idx} failed:`, (r.reason as Error)?.message);
    return fallback;
  };

  const productsKpi = pick(0, [{ count: 0 }]);
  const ordersKpi = pick(1, [{ count: 0 }]);
  const customersKpi = pick(2, [{ count: 0 }]);
  const revenueRow = pick(3, [{ total: 0 }]);
  const revenuePrevRow = pick(4, [{ total: 0 }]);
  const paidOrdersRow = pick(5, [{ count: 0 }]);
  const paidOrdersPrevRow = pick(6, [{ count: 0 }]);

  const revenue30 = Number(revenueRow[0]?.total ?? 0);
  const revenuePrev = Number(revenuePrevRow[0]?.total ?? 0);
  const paidOrders30 = Number(paidOrdersRow[0]?.count ?? 0);
  const paidOrdersPrev = Number(paidOrdersPrevRow[0]?.count ?? 0);

  const aov = paidOrders30 > 0 ? revenue30 / paidOrders30 : 0;
  const aovPrev = paidOrdersPrev > 0 ? revenuePrev / paidOrdersPrev : 0;

  const revenueDelta = pctDelta(revenue30, revenuePrev);
  const ordersDelta = pctDelta(paidOrders30, paidOrdersPrev);
  const aovDelta = pctDelta(aov, aovPrev);

  // Serie diaria de los últimos 30 días (ingresos + pedidos)
  const dailyRows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sum(orders.totalAmount),
      orders: count(orders.id),
    })
    .from(orders)
    .where(and(realSale, gte(orders.createdAt, start30)))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  const dailyMap = new Map(
    dailyRows.map((r) => [
      r.day,
      { revenue: Number(r.revenue ?? 0), orders: Number(r.orders ?? 0) },
    ]),
  );

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start30);
    d.setDate(start30.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const v = dailyMap.get(key) ?? { revenue: 0, orders: 0 };
    return { date: key, revenue: v.revenue, orders: v.orders };
  });

  // Pedidos recientes
  const recentOrders = await db
    .select({
      id: orders.id,
      paymentReference: orders.paymentReference,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      email: profiles.email,
    })
    .from(orders)
    .leftJoin(profiles, eq(orders.profileId, profiles.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  // Stock bajo (≤ 5 unidades)
  const lowStock = await db
    .select({
      sku: productVariants.sku,
      name: productVariants.name,
      stock: productVariants.stock,
      productTitle: products.title,
      productSlug: products.slug,
      productId: products.id,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        lte(productVariants.stock, 5),
        eq(productVariants.isActive, true),
      ),
    )
    .orderBy(asc(productVariants.stock))
    .limit(5);

  // Top categorías por número de productos
  const topCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug)
    .orderBy(desc(count(products.id)))
    .limit(5);

  const maxProducts = Math.max(...topCategories.map((c) => Number(c.productCount)), 1);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visión general de los últimos 30 días.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo producto
          </Link>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Ver pedidos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Ingresos (30d)"
          value={fmtCOP(revenue30)}
          delta={revenueDelta}
          accent="emerald"
        />
        <KpiCard
          icon={<ShoppingCart className="h-4 w-4" />}
          label="Pedidos pagados (30d)"
          value={fmtNumber(paidOrders30)}
          delta={ordersDelta}
          accent="blue"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Ticket promedio"
          value={fmtCOP(aov)}
          delta={aovDelta}
          accent="violet"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Clientes registrados"
          value={fmtNumber(Number(customersKpi[0]?.count ?? 0))}
          accent="rose"
          extra={`${fmtNumber(Number(productsKpi[0]?.count ?? 0))} productos · ${fmtNumber(Number(ordersKpi[0]?.count ?? 0))} pedidos totales`}
        />
      </div>

      {/* Sales chart + Top categories */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-foreground">
                Ingresos diarios
              </h2>
              <p className="text-xs text-muted-foreground">
                Últimos 30 días · pedidos pagados
              </p>
            </div>
          </div>
          <SalesChart data={chartData} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h2 className="font-serif text-lg text-foreground">
              Top categorías
            </h2>
            <p className="text-xs text-muted-foreground">
              Por número de productos
            </p>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin categorías todavía.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {topCategories.map((cat) => {
                const pct = Math.round(
                  (Number(cat.productCount) / maxProducts) * 100,
                );
                return (
                  <li key={cat.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {cat.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {fmtNumber(Number(cat.productCount))}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-foreground">
                Pedidos recientes
              </h2>
              <p className="text-xs text-muted-foreground">
                Últimos 5 pedidos creados
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Aún no hay pedidos.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-secondary/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-foreground">
                          {o.paymentReference}
                        </span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[o.firstName, o.lastName].filter(Boolean).join(" ") ||
                          o.email ||
                          "Cliente"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {fmtCOP(Number(o.totalAmount))}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-lg text-foreground">
                Stock bajo
              </h2>
              <p className="text-xs text-muted-foreground">
                Variantes con 5 o menos unidades
              </p>
            </div>
          </div>

          {lowStock.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Todo en orden.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lowStock.map((v) => (
                <li
                  key={v.sku}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3"
                >
                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/productos/${v.productId}/editar`}
                      className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {v.productTitle}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">
                      {v.name ?? v.sku}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      v.stock === 0 ? "text-destructive" : "text-amber-600"
                    }`}
                  >
                    {v.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function pctDelta(current: number, prev: number): number | null {
  if (prev === 0) return current === 0 ? 0 : null;
  return Math.round(((current - prev) / prev) * 100);
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  accent,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number | null;
  accent: "emerald" | "blue" | "violet" | "rose";
  extra?: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    blue: "bg-blue-500/10 text-blue-600",
    violet: "bg-violet-500/10 text-violet-600",
    rose: "bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentMap[accent]}`}>
          {icon}
        </div>
        {delta !== undefined && delta !== null && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              delta >= 0
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {extra && (
        <p className="mt-1.5 text-[11px] text-muted-foreground/80">{extra}</p>
      )}
    </div>
  );
}
