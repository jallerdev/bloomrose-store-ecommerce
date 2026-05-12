import Link from "next/link";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Nuevos Lanzamientos — Bloom Rose Accesorios",
  description:
    "Descubre las ultimas novedades en accesorios artesanales. Piezas recien llegadas a nuestra coleccion.",
};

const newProducts = [
  {
    name: "Luna Pearl Drop Earrings",
    category: "Aretes",
    price: 58,
    rating: 4.9,
    reviewCount: 12,
    image: "/products/earrings.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Bohemian Woven Bracelet",
    category: "Pulseras",
    price: 42,
    rating: 4.7,
    reviewCount: 8,
    image: "/products/bracelet.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Ivory Silk Scrunchie Set",
    category: "Accesorios",
    price: 24,
    rating: 4.8,
    reviewCount: 34,
    image: "/products/scrunchie.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Celestial Gold Ring",
    category: "Anillos",
    price: 76,
    rating: 4.6,
    reviewCount: 5,
    image: "/products/ring.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Vintage Floral Hair Clips",
    category: "Accesorios",
    price: 32,
    rating: 4.5,
    reviewCount: 19,
    image: "/products/hairclips.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Crystal Cascade Earrings",
    category: "Aretes",
    price: 64,
    rating: 4.8,
    reviewCount: 7,
    image: "/products/earrings-2.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
];

export default function NuevosPage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-extra-wide text-primary sm:text-xs">
              Recien llegados
            </p>
          </div>
          <h1 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Nuevos Lanzamientos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Las piezas mas recientes de nuestra coleccion. Se la primera en
            estrenar estos disenos exclusivos.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="font-semibold text-foreground">
                {newProducts.length}
              </span>{" "}
              productos nuevos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {newProducts.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
