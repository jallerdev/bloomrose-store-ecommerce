"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WishlistButton } from "@/components/WishlistButton";

interface ProductCardProps {
  /** ID del producto raíz — necesario para wishlist. Opcional para retrocompat. */
  productId?: string;
  name: string;
  category: string;
  price: number;
  /** Precio "antes". Si es mayor a `price`, se muestra tachado y se calcula % descuento. */
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  /** Material o nombre de variante destacada. Ej: "Oro 18k". */
  material?: string;
  /** Stock total agregado de todas las variantes activas. "Agotado" se
   * muestra solo cuando este valor es 0; "¡Solo quedan X!" cuando es ≤5. */
  stock?: number;
  /** # total de variantes del producto (para mostrar "+3 opciones"). */
  variantCount?: number;
  badge?: string;
  badgeVariant?: "sale" | "new" | "bestseller";
  slug?: string;
}

const FREE_SHIPPING_THRESHOLD = 200_000;
const LOW_STOCK_THRESHOLD = 5;

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function ProductCard({
  productId,
  name,
  category,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  material,
  stock,
  variantCount,
  badge,
  badgeVariant = "new",
  slug,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const href = slug ? `/productos/${slug}` : "#";

  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;

  const isOutOfStock = typeof stock === "number" && stock <= 0;
  const isLowStock =
    typeof stock === "number" && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  const hasFreeShipping = price >= FREE_SHIPPING_THRESHOLD;

  return (
    <article
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={href}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary block"
        aria-label={name}
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 ease-out",
            isHovered && !isOutOfStock && "scale-105",
            isOutOfStock && "opacity-60 grayscale",
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges esquina superior izquierda. Reglas de prioridad para evitar
            ruido visual:
            - Si está agotado, ese es el único badge.
            - Si hay descuento auto, suprimimos el badge manual "Oferta"
              (sería redundante con el "-XX%").
            `items-start` evita que los badges se estiren al ancho del más
            ancho (que es el bug visual del texto descentrado). */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
          {isOutOfStock ? (
            <Badge className="justify-center rounded-md border-none bg-foreground/90 px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-background sm:px-2.5 sm:text-xs">
              Agotado
            </Badge>
          ) : (
            <>
              {hasDiscount && (
                <Badge className="justify-center rounded-md border-none bg-destructive px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-destructive-foreground sm:px-2.5 sm:text-xs">
                  -{discountPct}%
                </Badge>
              )}
              {badge && !(hasDiscount && badgeVariant === "sale") && (
                <Badge
                  className={cn(
                    "justify-center rounded-md border-none px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider sm:px-2.5 sm:text-xs",
                    badgeVariant === "sale" && "bg-foreground text-background",
                    badgeVariant === "new" &&
                      "bg-primary text-primary-foreground",
                    badgeVariant === "bestseller" &&
                      "bg-card text-foreground shadow-sm",
                  )}
                >
                  {badge}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Wishlist */}
        {productId && (
          <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
            <WishlistButton productId={productId} onClickStop />
          </div>
        )}

        {/* Overlay hover "Ver detalles" — ocupa el bottom completo */}
        {!isOutOfStock && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-3 transition-all duration-300 sm:p-4",
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
          >
            <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground py-2.5 text-xs font-medium tracking-wide text-background sm:text-sm">
              <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Ver detalles
            </div>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-0.5 sm:mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
            {category}
          </p>
          {material && (
            <span className="text-[10px] font-medium text-muted-foreground/80 sm:text-xs">
              {material}
            </span>
          )}
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary sm:text-base">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1.5">
          <div
            className="flex items-center gap-0.5"
            aria-label={`${rating} de 5 estrellas`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${name}-${i}`}
                className={cn(
                  "h-3 w-3 sm:h-3.5 sm:w-3.5",
                  i < Math.floor(rating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted",
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground sm:text-xs">
            ({reviewCount})
          </span>
        </div>

        {/* Precio + tachado */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground sm:text-base">
            {fmtCOP(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through sm:text-sm">
              {fmtCOP(originalPrice!)}
            </span>
          )}
        </div>

        {/* Línea de meta: stock + variantes + envío gratis */}
        {(isLowStock ||
          (variantCount && variantCount > 1) ||
          (hasFreeShipping && !isOutOfStock)) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs">
            {isLowStock && (
              <span className="font-medium text-amber-600">
                ¡Solo quedan {stock}!
              </span>
            )}
            {variantCount && variantCount > 1 && (
              <span className="text-muted-foreground">
                +{variantCount - 1}{" "}
                {variantCount - 1 === 1 ? "opción" : "opciones"}
              </span>
            )}
            {hasFreeShipping && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <Truck className="h-3 w-3" />
                Envío gratis
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
