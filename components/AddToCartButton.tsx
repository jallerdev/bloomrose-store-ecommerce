"use client";

import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    productId: string;
    title: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    variant?: string;
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

  const totalQuantityOfProduct = items
    .filter((i) => i.productId === product.productId)
    .reduce((sum, i) => sum + i.quantity, 0);

  const isOutOfStock =
    product.stock <= 0 || totalQuantityOfProduct + quantity > product.stock;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir redirecciones si está dentro de un Link

    if (isOutOfStock) {
      if (totalQuantityOfProduct > 0) {
        toast.error(
          `Solo se permiten ${product.stock} máximo en total de la misma pieza. Ya tienes ${totalQuantityOfProduct} añadido(s).`,
        );
      } else {
        toast.error(`No hay más stock de ${product.title}`);
      }
      return;
    }

    addItem({ ...product, quantity });
    toast.success(
      `${quantity}x ${product.title} ${product.variant ? `(${product.variant})` : ""} añadido al carrito.`,
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
