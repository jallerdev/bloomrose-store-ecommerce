import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronRight,
  Flower2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?returnTo=/admin");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { role: true, firstName: true, email: true },
  });

  if (profile?.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Flower2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif text-sm font-semibold text-foreground">
              Bloom Rose
            </p>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {sidebarLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                    "hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer profile */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {profile?.firstName?.[0] || user.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">
                {profile?.firstName || "Admin"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
              <Flower2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-sm font-semibold text-foreground">
              Admin
            </span>
          </div>
          <div className="ml-auto">
            <Link
              href="/productos"
              className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
