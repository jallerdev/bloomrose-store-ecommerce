"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Share2,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { NotifyWhenInStock } from "@/components/NotifyWhenInStock";
import { analytics } from "@/lib/analytics";

export interface VariantDTO {
  id: string;
  sku: string;
  name: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
}

interface Props {
  product: {
    id: string;
    title: string;
    images: { url: string }[];
  };
  variants: VariantDTO[];
}

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const LOW_STOCK = 5;

export function ProductDetailClient({ product, variants }: Props) {
  const [selected, setSelected] = useState<VariantDTO>(variants[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    analytics.viewItem({
      item_id: product.id,
      item_name: product.title,
      item_variant: variants[0]?.name ?? undefined,
      price: Number(variants[0]?.price ?? 0),
    });
    // Sólo al montar (vista de PDP). No queremos disparar al cambiar variante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const price = Number(selected.price);
  const compareAt = selected.compareAtPrice
    ? Number(selected.compareAtPrice)
    : null;
  const hasDiscount = compareAt !== null && compareAt > price;
  const discountPct = hasDiscount
    ? Math.round(((compareAt! - price) / compareAt!) * 100)
    : 0;

  const isOutOfStock = selected.stock <= 0;
  const isLowStock = !isOutOfStock && selected.stock <= LOW_STOCK;

  function handleShare() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const nav = navigator as Navigator;
    if (typeof nav.share === "function") {
      nav.share({ title: product.title, url }).catch(() => {});
      return;
    }
    if (nav.clipboard) {
      nav.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    }
  }

  function changeVariant(id: string) {
    const v = variants.find((x) => x.id === id);
    if (v) {
      setSelected(v);
      setQuantity(1);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Precio */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          {fmtCOP(price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-base text-muted-foreground line-through sm:text-lg">
              {fmtCOP(compareAt!)}
            </span>
            <Badge className="rounded-md border-none bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
              -{discountPct}%
            </Badge>
          </>
        )}
      </div>

      {/* Selector de variantes */}
      {variants.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">
            Opción:{" "}
            <span className="font-normal text-muted-foreground">
              {selected.name ?? selected.sku}
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const out = v.stock <= 0;
              const active = v.id === selected.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => changeVariant(v.id)}
                  className={cn(
                    "relative rounded-lg border-2 px-4 py-2 text-sm transition-all",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/50",
                    out && "cursor-not-allowed opacity-50",
                  )}
                  aria-pressed={active}
                >
                  {v.name ?? v.sku}
                  {active && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  )}
                  {out && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-px w-[110%] -rotate-12 bg-muted-foreground/40" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <>
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-destructive">
              Agotado
            </span>
          </>
        ) : isLowStock ? (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-600">
              ¡Solo quedan {selected.stock}!
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">
              En stock · {selected.stock} disponibles
            </span>
          </>
        )}
      </div>

      <Separator />

      {/* Acciones de compra
          Mobile: row 1 (cantidad + carrito) + row 2 (wishlist + share, 50/50)
          Desktop sm+: todo en una sola fila */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex gap-3 sm:contents">
          <div className="flex h-12 shrink-0 items-center overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="flex h-full w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:text-muted-foreground sm:w-12"
              aria-label="Reducir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-full w-10 items-center justify-center border-x border-border text-sm font-medium tabular-nums sm:w-12">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(selected.stock, q + 1))}
              disabled={quantity >= selected.stock || isOutOfStock}
              className="flex h-full w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:text-muted-foreground sm:w-12"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <AddToCartButton
            product={{
              id: selected.id,
              productId: product.id,
              title: product.title,
              price,
              stock: selected.stock,
              imageUrl: product.images[0]?.url ?? "",
              variantName: selected.name ?? undefined,
            }}
            quantity={quantity}
            className="h-12 flex-1 rounded-xl bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3 sm:contents">
          <WishlistButton
            productId={product.id}
            productName={product.title}
            productPrice={price}
            variant="lg"
            className="h-12 flex-1 sm:flex-initial"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 flex-1 rounded-xl sm:w-12 sm:flex-initial"
            onClick={handleShare}
            aria-label="Compartir"
          >
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {isOutOfStock && (
        <NotifyWhenInStock
          productId={product.id}
          className="w-full rounded-xl"
        />
      )}

      <Separator />

      {/* Pills de confianza */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TrustPill
          icon={<Truck className="h-4 w-4 text-primary" />}
          title="Envío gratis"
          description="En pedidos sobre $200.000"
        />
        <TrustPill
          icon={<RotateCcw className="h-4 w-4 text-primary" />}
          title="Garantía de calidad"
          description="Devolución por defecto de fábrica"
        />
        <TrustPill
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          title="Calidad garantizada"
          description="Piezas seleccionadas a mano"
        />
        <TrustPill
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          title="Pago seguro"
          description="Tarjeta · PSE · Nequi · Bancolombia"
        />
      </ul>

      {/* SKU */}
      <p className="text-xs text-muted-foreground">SKU · {selected.sku}</p>
    </div>
  );
}

function TrustPill({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
