import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, ShoppingCart, Users } from "lucide-react";
import { db } from "@/lib/db";
import { products, orders, profiles } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export const metadata = { title: "Admin — Bloom Rose" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Quick stats
  const [productCount] = await db.select({ count: count() }).from(products);
  const [orderCount] = await db.select({ count: count() }).from(orders);
  const [customerCount] = await db.select({ count: count() }).from(profiles);

  const stats = [
    {
      label: "Productos activos",
      value: productCount?.count ?? 0,
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Pedidos totales",
      value: orderCount?.count ?? 0,
      icon: ShoppingCart,
      href: "/admin/pedidos",
    },
    {
      label: "Clientes",
      value: customerCount?.count ?? 0,
      icon: Users,
      href: "/admin/clientes",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenido al panel de administración de Bloom Rose.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-secondary/30"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg text-foreground">
          Accesos Rápidos
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Nuevo Producto
          </Link>
          <Link
            href="/admin/pedidos"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Ver pedidos pendientes
          </Link>
        </div>
      </div>
    </div>
  );
}
