"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/auth/actions";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { CartSheet } from "@/components/CartSheet";
import { WishlistHeaderButton } from "@/components/WishlistHeaderButton";
import { SearchDialog } from "@/components/SearchDialog";

const navItems = [
  { label: "Tienda", href: "/productos" },
  { label: "Nuevos", href: "/nuevos" },
  { label: "Colecciones", href: "/colecciones" },
  { label: "Nosotros", href: "/nosotros" },
];

export function StoreHeaderClient({
  serverUser,
  serverRole,
}: {
  serverUser: any;
  serverRole: string | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const setUserId = useCartStore((state) => state.setUserId);
  const setWishlistUserId = useWishlistStore((state) => state.setUserId);

  useEffect(() => {
    if (serverUser?.id) {
      setUserId(serverUser.id);
      void setWishlistUserId(serverUser.id);
    } else {
      setUserId(null);
      void setWishlistUserId(null);
    }
  }, [serverUser, setUserId, setWishlistUserId]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:hidden"
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Bloomrose Accesorios - Inicio"
          >
            <Image
              src="/images/image.webp"
              alt=""
              width={36}
              height={36}
              className="rounded-full sm:h-10 sm:w-10"
            />
            <span className="hidden font-brand text-2xl leading-none tracking-tight text-foreground sm:inline-block sm:text-3xl">
              Bloomrose
            </span>
          </Link>
        </div>
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
          {serverUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="Menu de Usuario"
                >
                  {serverUser.user_metadata?.avatar_url ? (
                    <Image
                      src={serverUser.user_metadata.avatar_url}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {serverUser.user_metadata?.first_name?.[0] ||
                        serverUser.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {serverUser.user_metadata?.first_name
                        ? `${serverUser.user_metadata.first_name} ${serverUser.user_metadata.last_name || ""}`
                        : "Mi Cuenta"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {serverUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/perfil/configuracion"
                    className="w-full cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                {serverRole === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="w-full cursor-pointer text-primary"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <form action={logoutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center cursor-pointer outline-none"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="Iniciar sesión"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          )}

          <SearchDialog />
          <WishlistHeaderButton />
          <CartSheet />
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border transition-all duration-300 sm:hidden",
          mobileMenuOpen ? "max-h-60" : "max-h-0 border-t-0",
        )}
      >
        <nav id="mobile-nav" aria-label="Menu movil" className="px-4 py-4">
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
