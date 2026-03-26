"use client";

import { useCartStore } from "@/lib/store/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function CartSheet() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } =
    useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = getTotalItems();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          aria-label="Carrito de compras"
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          {mounted && totalItems > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md w-full border-l border-border bg-background shadow-lg pr-4">
        <SheetHeader>
          <SheetTitle className="text-left font-serif text-2xl text-foreground">
            Tu Carrito
          </SheetTitle>
        </SheetHeader>

        {!mounted ? (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">
              Tu carrito está vacío
            </p>
            <Button
              asChild
              className="mt-4 rounded-xl bg-primary px-8 text-primary-foreground"
            >
              <Link href="/products">Explorar Catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 pr-4">
              <ul className="flex flex-col gap-6">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-medium text-foreground">
                            {item.title}
                          </h3>
                          {item.variant && (
                            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                              Color/Variante: {item.variant}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            ${item.price.toLocaleString("es-MX")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex h-8 items-center overflow-hidden rounded-md border border-border">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-full w-8 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-full w-8 items-center justify-center border-x border-border text-xs font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="flex h-full w-8 items-center justify-center text-foreground hover:bg-secondary disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-6 pb-2">
              <div className="flex items-center justify-between text-base font-medium text-foreground">
                <p>Subtotal ({totalItems} items)</p>
                <p>${getTotalPrice().toLocaleString("es-MX")}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Los impuestos y gastos de envío se calculan en la pantalla de
                pago.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  asChild
                  className="w-full rounded-xl bg-foreground py-6 text-base font-medium tracking-wide text-background hover:bg-foreground/90"
                >
                  <Link href="/checkout">Ir a Pagar</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
