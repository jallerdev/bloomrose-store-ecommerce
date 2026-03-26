"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  badgeVariant?: "sale" | "new" | "bestseller";
  slug?: string;
}

export function ProductCard({
  name,
  category,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  badge,
  badgeVariant = "new",
  slug,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const href = slug ? `/productos/${slug}` : "#";

  return (
    <article
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        href={href}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary block"
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 ease-out",
            isHovered && "scale-105",
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badge */}
        {badge && (
          <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
            <Badge
              className={cn(
                "rounded-md border-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:px-2.5 sm:text-xs",
                badgeVariant === "sale" && "bg-foreground text-background",
                badgeVariant === "new" && "bg-primary text-primary-foreground",
                badgeVariant === "bestseller" &&
                  "bg-card text-foreground shadow-sm",
              )}
            >
              {badge}
            </Badge>
          </div>
        )}
      </Link>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsWishlisted(!isWishlisted);
        }}
        className={cn(
          "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all duration-200 hover:bg-card sm:right-3 sm:top-3 sm:h-9 sm:w-9 pointer-events-auto",
          isWishlisted && "bg-secondary",
        )}
        aria-label={
          isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"
        }
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200 sm:h-[18px] sm:w-[18px]",
            isWishlisted
              ? "fill-primary text-primary"
              : "text-muted-foreground",
          )}
        />
      </button>

      {/* Add to Cart Overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-end justify-center p-3 transition-all duration-300 sm:p-4 pointer-events-none",
          isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <Button
          size="sm"
          asChild
          className="h-9 w-full rounded-lg bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 sm:h-10 sm:text-sm pointer-events-auto"
        >
          <Link href={href}>
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Ver detalles
          </Link>
        </Button>
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col gap-0.5 sm:mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
          {category}
        </p>
        <Link href={href}>
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 hover:text-primary transition-colors sm:text-base">
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

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground sm:text-base">
            ${price.toLocaleString("es-MX")}
          </span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through sm:text-sm">
              ${originalPrice.toLocaleString("es-MX")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
