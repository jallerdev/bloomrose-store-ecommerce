import { Sparkles } from "lucide-react";

import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { getCatalogProducts } from "@/lib/db/cached";

export const metadata = {
  title: "Nuevos Lanzamientos — Bloom Rose Accesorios",
  description:
    "Descubre las últimas novedades en accesorios artesanales. Piezas recién llegadas a nuestra colección.",
  alternates: { canonical: "/nuevos" },
};

// Ventana de "novedad": productos creados en los últimos 30 días.
const NEWNESS_WINDOW_DAYS = 30;

export default async function NuevosPage() {
  const rows = await getCatalogProducts();
  const cutoff = Date.now() - NEWNESS_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const newProducts = rows
    .filter(
      (p) =>
        p.variants.length > 0 &&
        new Date(p.createdAt).getTime() >= cutoff,
    )
    .map((product) => {
      const defaultVariant = product.variants[0];
      const totalStock = product.variants.reduce(
        (acc, v) => acc + v.stock,
        0,
      );
      return {
        id: product.id,
        productId: product.id,
        slug: product.slug,
        name: product.title,
        category: product.category?.name ?? "Accesorio",
        price: Number(defaultVariant.price),
        originalPrice: defaultVariant.compareAtPrice
          ? Number(defaultVariant.compareAtPrice)
          : undefined,
        material: defaultVariant.name ?? undefined,
        defaultVariantId: defaultVariant.id,
        defaultVariantName: defaultVariant.name ?? undefined,
        defaultVariantStock: defaultVariant.stock,
        stock: totalStock,
        variantCount: product.variants.length,
        image: product.images[0]?.url ?? "",
        rating: 5,
        reviewCount: 0,
      };
    });

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
              Recién llegados
            </p>
          </div>
          <h1 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Nuevos Lanzamientos
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Las piezas más recientes de nuestra colección. Sé la primera en
            estrenar estos diseños exclusivos.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {newProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aún no hay novedades. Vuelve pronto.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  <span className="font-semibold text-foreground">
                    {newProducts.length}
                  </span>{" "}
                  {newProducts.length === 1
                    ? "producto nuevo"
                    : "productos nuevos"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-8">
                {newProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    productId={p.productId}
                    defaultVariantId={p.defaultVariantId}
                    defaultVariantName={p.defaultVariantName}
                    defaultVariantStock={p.defaultVariantStock}
                    slug={p.slug}
                    name={p.name}
                    category={p.category}
                    price={p.price}
                    originalPrice={p.originalPrice}
                    material={p.material}
                    stock={p.stock}
                    variantCount={p.variantCount}
                    image={p.image}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    badge="Nuevo"
                    badgeVariant="new"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
