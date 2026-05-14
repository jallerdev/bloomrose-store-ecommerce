"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Star, Truck, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WishlistButton } from "@/components/WishlistButton";
import { useCartStore } from "@/lib/store/cart";
import { analytics } from "@/lib/analytics";
import { FREE_SHIPPING_THRESHOLD_COP } from "@/lib/shipping";

interface ProductCardProps {
  /** ID del producto raíz — necesario para wishlist. Opcional para retrocompat. */
  productId?: string;
  /** ID de la variante por defecto (la primera). Permite quick-add desde el card. */
  defaultVariantId?: string;
  /** Nombre/material de la variante por defecto (para tracking y carrito). */
  defaultVariantName?: string;
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
  /** Stock de la variante por defecto (para validar quick-add). */
  defaultVariantStock?: number;
  /** # total de variantes del producto (para mostrar "+3 opciones"). */
  variantCount?: number;
  badge?: string;
  badgeVariant?: "sale" | "new" | "bestseller";
  slug?: string;
}

const LOW_STOCK_THRESHOLD = 5;

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function ProductCard({
  productId,
  defaultVariantId,
  defaultVariantName,
  defaultVariantStock,
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
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);

  const href = slug ? `/productos/${slug}` : "#";

  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;

  const isOutOfStock = typeof stock === "number" && stock <= 0;
  const isLowStock =
    typeof stock === "number" && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  const hasFreeShipping = price >= FREE_SHIPPING_THRESHOLD_COP;
  const isMultiVariant = (variantCount ?? 1) > 1;
  const canQuickAdd =
    !isOutOfStock && !isMultiVariant && Boolean(defaultVariantId);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMultiVariant) {
      router.push(href);
      return;
    }
    if (!defaultVariantId || !productId) {
      router.push(href);
      return;
    }

    const variantStock = defaultVariantStock ?? stock ?? 0;
    const alreadyInCart = items
      .filter((i) => i.id === defaultVariantId)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (variantStock <= 0) {
      toast.error(`Agotado: ${name}`);
      return;
    }
    if (alreadyInCart + 1 > variantStock) {
      toast.error(
        `Solo hay ${variantStock} unidades disponibles. Ya tienes ${alreadyInCart} en el carrito.`,
      );
      return;
    }

    addItem({
      id: defaultVariantId,
      productId,
      title: name,
      price,
      imageUrl: image || null,
      stock: variantStock,
      variantName: defaultVariantName,
      quantity: 1,
    });
    analytics.addToCart({
      item_id: defaultVariantId,
      item_name: name,
      item_variant: defaultVariantName,
      price,
      quantity: 1,
    });
    toast.success(`${name} añadido al carrito`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="group relative flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary"
        aria-label={name}
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            !isOutOfStock && "group-hover:scale-110",
            isOutOfStock && "opacity-60 grayscale",
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Subtle gradient at bottom for legibility of quick-add button */}
        {!isOutOfStock && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* Badges esquina superior izquierda */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
          {isOutOfStock ? (
            <Badge className="justify-center rounded-md border-none bg-foreground/90 px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-background sm:px-2.5 sm:text-xs">
              Agotado
            </Badge>
          ) : (
            <>
              {hasDiscount && (
                <Badge className="justify-center rounded-md border-none bg-destructive px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-destructive-foreground shadow-sm sm:px-2.5 sm:text-xs">
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

        {/* CTA flotante bottom-right.
            - Multi-variante o sin variantId: "Ver opciones" → PDP
            - Single + en stock: quick add */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 z-10 sm:bottom-4 sm:left-4 sm:right-4">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full bg-foreground/95 px-4 py-2.5 text-xs font-medium text-background shadow-lg backdrop-blur-sm transition-all duration-300",
                "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 sm:text-sm",
                "focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                justAdded && "bg-emerald-600 text-white",
              )}
              aria-label={
                justAdded
                  ? "Producto añadido al carrito"
                  : isMultiVariant
                    ? `Ver opciones de ${name}`
                    : `Añadir ${name} al carrito`
              }
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Añadido
                </>
              ) : isMultiVariant || !canQuickAdd ? (
                <>
                  Ver opciones
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Añadir al carrito
                </>
              )}
            </button>
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
            role="img"
            aria-label={`${rating} de 5 estrellas`}
            className="flex items-center gap-0.5"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${name}-${i}`}
                aria-hidden="true"
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

        {/* Mobile: botón CTA siempre visible (no depende de hover) */}
        {!isOutOfStock && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className={cn(
              "mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-foreground bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background sm:hidden",
              justAdded && "border-emerald-600 bg-emerald-600 text-white",
            )}
            aria-label={
              isMultiVariant
                ? `Ver opciones de ${name}`
                : `Añadir ${name} al carrito`
            }
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Añadido
              </>
            ) : isMultiVariant || !canQuickAdd ? (
              <>
                Ver opciones
                <ArrowRight className="h-3 w-3" />
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                Añadir al carrito
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
