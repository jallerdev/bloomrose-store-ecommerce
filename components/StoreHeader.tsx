"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@auth0/nextjs-auth0/client";
import { CartSheet } from "@/components/CartSheet";

const navItems = [
  { label: "Tienda", href: "/products" },
  { label: "Nuevos", href: "/nuevos" },
  { label: "Colecciones", href: "/colecciones" },
  { label: "Nosotros", href: "/nosotros" },
];

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-foreground sm:hidden"
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Bloom Rose Accesorios - Inicio"
          >
            <Image
              src="/images/image.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full sm:h-10 sm:w-10"
            />
            <span className="hidden font-serif text-lg tracking-tight text-foreground sm:inline-block sm:text-xl">
              Bloom Rose
            </span>
          </Link>
        </div>
        {/* Desktop Nav */}
        <nav aria-label="Navegacion principal" className="hidden sm:block">
          <ul className="flex items-center gap-8 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === item.href && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isLoading && user ? (
            <Link
              href="/auth/logout"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Cerrar sesión"
            >
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <User className="h-[18px] w-[18px]" />
              )}
            </Link>
          ) : !isLoading && !user ? (
            <Link
              href="/auth/login"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Iniciar sesión"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          ) : null}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label="Buscar"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <CartSheet />
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border transition-all duration-300 sm:hidden",
          mobileMenuOpen ? "max-h-60" : "max-h-0 border-t-0",
        )}
      >
        <nav aria-label="Menu movil" className="px-4 py-4">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm font-medium text-foreground transition-colors hover:text-primary",
                    pathname === item.href && "text-primary",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
