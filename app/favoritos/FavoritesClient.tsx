"use client";

import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/lib/store/wishlist";

interface ProductLite {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  material?: string;
  stock: number;
  variantCount: number;
  image: string;
}

interface Props {
  products: ProductLite[];
}

export function FavoritesClient({ products }: Props) {
  const [mounted, setMounted] = useState(false);
  const items = useWishlistStore((s) => s.items);
  const syncing = useWishlistStore((s) => s.syncing);

  useEffect(() => setMounted(true), []);

  if (!mounted || syncing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const favorites = products.filter((p) => items.includes(p.id));

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div>
          <p className="font-serif text-xl text-foreground">
            Aún no tienes favoritos
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Agrega piezas a tu lista tocando el corazón en cualquier producto.
            Tus favoritos se guardan en este dispositivo y, si inicias sesión,
            también en tu cuenta.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos">Explorar catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {favorites.length} pieza{favorites.length === 1 ? "" : "s"} en tu lista
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
        {favorites.map((p) => (
          <ProductCard
            key={p.id}
            productId={p.id}
            slug={p.slug}
            name={p.title}
            category={p.category}
            price={p.price}
            originalPrice={p.originalPrice}
            material={p.material}
            stock={p.stock}
            variantCount={p.variantCount}
            image={p.image}
            rating={5}
            reviewCount={0}
          />
        ))}
      </div>
    </>
  );
}
