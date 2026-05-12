"use client";

import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

interface AddToCartButtonProps {
  product: {
    id: string; // Maps to productVariantId
    productId: string; // Maps to root productId
    title: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    variantName?: string;
  };
  quantity?: number;
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  // Consider stock boundaries local to this EXACT variant ID
  const totalQuantityOfVariant = items
    .filter((i) => i.id === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const isOutOfStock =
    product.stock <= 0 || totalQuantityOfVariant + quantity > product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOutOfStock) {
      if (totalQuantityOfVariant > 0) {
        toast.error(
          `Solo se permiten ${product.stock} máximo de esta variante. Ya tienes ${totalQuantityOfVariant} añadido(s).`,
        );
      } else {
        toast.error(
          `Agotado: No hay stock de ${product.title} ${product.variantName ? `(${product.variantName})` : ""}`,
        );
      }
      return;
    }

    addItem({ ...product, quantity });
    analytics.addToCart({
      item_id: product.id,
      item_name: product.title,
      item_variant: product.variantName,
      price: product.price,
      quantity,
    });
    toast.success(
      `${quantity}x ${product.title} ${product.variantName ? `(${product.variantName})` : ""} añadido al carrito.`,
    );
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label={isOutOfStock ? "Agotado" : "Añadir al Carrito"}
    >
      <ShoppingBag className="h-5 w-5" />
      <span>{isOutOfStock ? "Agotado" : "Añadir al Carrito"}</span>
    </button>
  );
}
