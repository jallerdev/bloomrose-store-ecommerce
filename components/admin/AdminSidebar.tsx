"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Ticket,
  Flower2,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarLinkData {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface User {
  firstName: string | null;
  email: string;
}

function buildLinks(pendingOrdersCount: number): SidebarLinkData[] {
  return [
    { label: "Resumen", href: "/admin", icon: LayoutDashboard },
    { label: "Productos", href: "/admin/productos", icon: Package },
    { label: "Categorías", href: "/admin/categories", icon: Tag },
    {
      label: "Pedidos",
      href: "/admin/pedidos",
      icon: ShoppingCart,
      badge: pendingOrdersCount,
    },
    { label: "Cupones", href: "/admin/cupones", icon: Ticket },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
  ];
}

function isActive(pathname: string | null, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return Boolean(pathname?.startsWith(href));
}

function SidebarBody({
  user,
  pendingOrdersCount,
  collapsed,
  onNavigate,
  onToggle,
}: {
  user: User;
  pendingOrdersCount: number;
  collapsed: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const links = buildLinks(pendingOrdersCount);

  return (
    <>
      {/* Brand + toggle */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-5",
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 transition-colors hover:opacity-80",
            collapsed && "justify-center",
          )}
          aria-label="Bloomrose Admin"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <Flower2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-serif text-sm font-semibold text-foreground">
                Bloomrose
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Admin Panel
              </p>
            </div>
          )}
        </Link>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:flex",
              collapsed && "absolute -right-3 top-5 h-6 w-6 rounded-full border border-border bg-card shadow-sm",
            )}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Gestión
          </p>
        )}
        <ul className="flex flex-col gap-0.5">
          {links.map((item) => {
            const active = isActive(pathname, item.href);
            const showBadge = item.badge !== undefined && item.badge > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-lg text-sm font-medium transition-all",
                    collapsed
                      ? "h-10 w-full justify-center"
                      : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  {active && collapsed && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <span className="relative">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "",
                      )}
                    />
                    {collapsed && showBadge && (
                      <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-card" />
                    )}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {showBadge && (
                        <Badge className="h-5 min-w-5 justify-center rounded-full border-none bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer profile */}
      <div className={cn("border-t border-border", collapsed ? "p-2" : "px-4 py-4")}>
        <Link
          href="/perfil"
          onClick={onNavigate}
          title={collapsed ? user.firstName ?? user.email : undefined}
          className={cn(
            "flex items-center rounded-lg transition-colors hover:bg-secondary",
            collapsed ? "justify-center p-1.5" : "gap-2.5 p-2",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
            {user.firstName?.[0]?.toUpperCase() ||
              user.email?.[0]?.toUpperCase() ||
              "A"}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-xs font-medium text-foreground">
                {user.firstName || "Admin"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar({
  user,
  pendingOrdersCount,
  collapsed,
  onToggle,
}: {
  user: User;
  pendingOrdersCount: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarBody
        user={user}
        pendingOrdersCount={pendingOrdersCount}
        collapsed={collapsed}
        onToggle={onToggle}
      />
    </aside>
  );
}

export function AdminMobileMenu({
  user,
  pendingOrdersCount,
}: {
  user: User;
  pendingOrdersCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-secondary lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarBody
              user={user}
              pendingOrdersCount={pendingOrdersCount}
              collapsed={false}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
