"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { AdminSidebar, AdminMobileMenu } from "./AdminSidebar";

const STORAGE_KEY = "bloomrose-admin-sidebar-collapsed";

interface User {
  firstName: string | null;
  email: string;
}

interface Props {
  user: User;
  pendingOrdersCount: number;
  greeting: string;
  children: React.ReactNode;
}

export function AdminShell({
  user,
  pendingOrdersCount,
  greeting,
  children,
}: Props) {
  // Hidratamos primero como `false` para evitar mismatch SSR; luego leemos localStorage.
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar fijo a la izquierda (desktop) */}
      <AdminSidebar
        user={user}
        pendingOrdersCount={pendingOrdersCount}
        collapsed={collapsed}
        onToggle={toggle}
      />

      {/* Contenedor principal con margen reservado para el sidebar */}
      <div
        className={cn(
          "flex min-h-screen flex-col",
          // En lg+: empuja el contenido por el sidebar fixed.
          // Solo aplicamos la transición cuando ya hidratamos para que el primer render
          // no muestre un "salto" de 64 → 16 px si el usuario lo tenía colapsado.
          hydrated && "transition-[margin] duration-200",
          collapsed ? "lg:ml-16" : "lg:ml-64",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <AdminMobileMenu
            user={user}
            pendingOrdersCount={pendingOrdersCount}
          />

          <div className="flex flex-1 items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {greeting},{" "}
              <span className="font-medium text-foreground">
                {user.firstName || "Admin"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {pendingOrdersCount > 0 && (
              <Link
                href="/admin/pedidos"
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={`${pendingOrdersCount} pedidos por procesar`}
                title={`${pendingOrdersCount} pedidos por procesar`}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-card" />
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Ver tienda
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
