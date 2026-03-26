"use client";

import { useState } from "react";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";

interface ColorOption {
  name: string;
  value: string;
  inStock: boolean;
}

interface ProductInfoProps {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  colors: ColorOption[];
  stockCount: number;
  badge?: string;
  badgeVariant?: "sale" | "new" | "bestseller";
  sku: string;
}

export function ProductInfo({
  id,
  imageUrl,
  name,
  category,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  colors,
  stockCount,
  badge,
  badgeVariant = "new",
  sku,
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav
        aria-label="Ruta"
        className="flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <a href="#" className="transition-colors hover:text-foreground">
          Inicio
        </a>
        <span>/</span>
        <a href="#" className="transition-colors hover:text-foreground">
          {category}
        </a>
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Badge + Category */}
      <div className="flex items-center gap-3">
        {badge && (
          <Badge
            className={cn(
              "rounded-md border-none px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              badgeVariant === "sale" && "bg-foreground text-background",
              badgeVariant === "new" && "bg-primary text-primary-foreground",
              badgeVariant === "bestseller" && "bg-secondary text-foreground",
            )}
          >
            {badge}
          </Badge>
        )}
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl text-balance">
        {name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-0.5"
          aria-label={`${rating} de 5 estrellas`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`rating-star-${i}`}
              className={cn(
                "h-4 w-4",
                i < Math.floor(rating)
                  ? "fill-primary text-primary"
                  : "fill-muted text-muted",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} ({reviewCount} resenas)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-foreground sm:text-3xl">
          ${price.toLocaleString("es-MX")}
        </span>
        {originalPrice && (
          <>
            <span className="text-base text-muted-foreground line-through sm:text-lg">
              ${originalPrice.toLocaleString("es-MX")}
            </span>
            <Badge className="rounded-md border-none bg-foreground text-background px-2 py-0.5 text-xs font-semibold">
              -{discount}%
            </Badge>
          </>
        )}
      </div>

      <Separator />

      {/* Description */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Color Selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Color:{" "}
            <span className="font-normal text-muted-foreground">
              {selectedColor}
            </span>
          </span>
        </div>
        <div
          className="flex flex-wrap gap-2.5"
          role="radiogroup"
          aria-label="Seleccionar color"
        >
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => color.inStock && setSelectedColor(color.name)}
              disabled={!color.inStock}
              className={cn(
                "relative h-10 w-10 rounded-full border-2 transition-all duration-200",
                selectedColor === color.name
                  ? "border-foreground ring-2 ring-foreground/20"
                  : "border-border hover:border-accent",
                !color.inStock && "cursor-not-allowed opacity-40",
              )}
              style={{ backgroundColor: color.value }}
              aria-label={`${color.name}${!color.inStock ? " - agotado" : ""}`}
              aria-checked={selectedColor === color.name}
              role="radio"
            >
              {selectedColor === color.name && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-4 w-4",
                    isLightColor(color.value)
                      ? "text-foreground"
                      : "text-background",
                  )}
                />
              )}
              {!color.inStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[120%] w-px rotate-45 bg-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Indicator */}
      <div className="flex items-center gap-2">
        {stockCount > 0 ? (
          <>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                stockCount <= 5 ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                stockCount <= 5 ? "text-amber-600" : "text-emerald-600",
              )}
            >
              {stockCount <= 5
                ? `Solo quedan ${stockCount} unidades`
                : "En stock"}
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-destructive">
              Agotado
            </span>
          </>
        )}
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Quantity Selector */}
        <div className="flex h-12 items-center overflow-hidden rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            className="flex h-full w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:text-muted-foreground"
            aria-label="Reducir cantidad"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="flex h-full w-12 items-center justify-center border-x border-border text-sm font-medium text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => Math.min(stockCount, prev + 1))
            }
            disabled={quantity >= stockCount}
            className="flex h-full w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:text-muted-foreground"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart */}
        <AddToCartButton
          product={{
            productId: id,
            title: name,
            price,
            stock: stockCount,
            imageUrl: imageUrl,
            variant: selectedColor,
          }}
          quantity={quantity}
          className="h-12 flex-1 rounded-xl bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 disabled:opacity-50"
        />

        {/* Wishlist */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-12 w-12 flex-shrink-0 rounded-xl border-border transition-all",
            isWishlisted && "border-primary bg-secondary",
          )}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label={
            isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isWishlisted
                ? "fill-primary text-primary"
                : "text-muted-foreground",
            )}
          />
        </Button>
      </div>

      <Separator />

      {/* Shipping & Policies */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Truck className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Envio gratis</p>
            <p className="text-xs text-muted-foreground">
              En pedidos mayores a $299
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
            <RotateCcw className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Devoluciones</p>
            <p className="text-xs text-muted-foreground">
              30 dias para cambios y devoluciones
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Shield className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Garantia</p>
            <p className="text-xs text-muted-foreground">
              6 meses de garantia en todas las piezas
            </p>
          </div>
        </div>
      </div>

      {/* SKU */}
      <p className="text-xs text-muted-foreground">SKU: {sku}</p>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = Number.parseInt(c.substring(0, 2), 16);
  const g = Number.parseInt(c.substring(2, 4), 16);
  const b = Number.parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}
