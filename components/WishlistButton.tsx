"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/store/wishlist";
import { analytics } from "@/lib/analytics";

interface Props {
  productId: string;
  productName?: string;
  productPrice?: number;
  /**
   * "icon" — botón circular pequeño (para usar en cards)
   * "lg"   — botón grande con texto (para PDP)
   */
  variant?: "icon" | "lg";
  className?: string;
  onClickStop?: boolean;
}

export function WishlistButton({
  productId,
  productName,
  productPrice,
  variant = "icon",
  className,
  onClickStop = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const has = useWishlistStore((s) => s.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  useEffect(() => setMounted(true), []);

  function handleClick(e: React.MouseEvent) {
    if (onClickStop) {
      e.preventDefault();
      e.stopPropagation();
    }
    const willAdd = !has;
    startTransition(async () => {
      await toggle(productId);
      if (willAdd) {
        toast.success("Agregado a favoritos");
        analytics.addToWishlist({
          item_id: productId,
          item_name: productName ?? productId,
          price: productPrice ?? 0,
        });
      } else {
        toast.success("Removido de favoritos");
      }
    });
  }

  // Antes de hidratar mostramos siempre el corazón vacío para evitar mismatch.
  const filled = mounted && has;

  if (variant === "lg") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border transition-all hover:bg-secondary disabled:opacity-50",
          filled && "border-primary bg-secondary",
          className,
        )}
        aria-label={filled ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={filled}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            filled ? "fill-primary text-primary" : "text-muted-foreground",
          )}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200 hover:bg-card sm:h-9 sm:w-9 disabled:opacity-60",
        filled && "bg-secondary",
        className,
      )}
      aria-label={filled ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={filled}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200 sm:h-[18px] sm:w-[18px]",
          filled ? "fill-primary text-primary" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
