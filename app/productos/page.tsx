import { Suspense } from "react";
import { Tag } from "lucide-react";

import { getCatalogProducts } from "@/lib/db/cached";

import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters, type FilterFacets } from "@/components/ProductFilters";

export const metadata = {
  title: "Catálogo de accesorios",
  description:
    "Explora nuestra colección de bisutería artesanal: aretes, collares, pulseras, anillos y más, con envíos a toda Colombia.",
  alternates: { canonical: "/productos" },
  openGraph: {
    title: "Catálogo de accesorios · Bloomrose",
    description:
      "Bisutería artesanal hecha en Colombia. Aretes, collares, pulseras y anillos.",
    url: "/productos",
    type: "website",
  },
};

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: { name: string; slug: string } | null;
  variants: {
    name: string | null;
    price: string;
    compareAtPrice: string | null;
    stock: number;
  }[];
  images: { url: string }[];
}

export default async function ProductosPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const material =
    typeof params.material === "string" ? params.material : undefined;
  const maxPriceParam =
    typeof params.maxPrice === "string"
      ? parseFloat(params.maxPrice)
      : undefined;

  // Catálogo activo + relaciones para construir facets dinámicas (cacheado)
  let allActiveProducts: ProductRow[] = [];
  let dbError: unknown = null;
  try {
    const rows = await getCatalogProducts();
    allActiveProducts = rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      category: p.category
        ? { name: p.category.name, slug: p.category.slug }
        : null,
      variants: p.variants.map((v) => ({
        name: v.name,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
      })),
      images: p.images.map((i) => ({ url: i.url })),
    }));
  } catch (err) {
    dbError = err;
    console.error("Database fetch error in products catalog", err);
  }

  // ── Facets dinámicas (categorías, materiales, rango de precio)
  const allCategoriesMap = new Map<string, { slug: string; name: string }>();
  const allMaterialsSet = new Set<string>();
  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = 0;

  for (const p of allActiveProducts) {
    if (p.variants.length === 0) continue;
    if (p.category) {
      allCategoriesMap.set(p.category.slug, {
        slug: p.category.slug,
        name: p.category.name,
      });
    }
    for (const v of p.variants) {
      if (v.name) allMaterialsSet.add(v.name);
      const price = Number(v.price);
      if (price < priceMin) priceMin = price;
      if (price > priceMax) priceMax = price;
    }
  }
  if (priceMin === Number.POSITIVE_INFINITY) {
    priceMin = 0;
    priceMax = 500_000;
  } else {
    priceMin = Math.floor(priceMin / 1000) * 1000;
    priceMax = Math.ceil(priceMax / 1000) * 1000;
  }

  const facets: FilterFacets = {
    categories: Array.from(allCategoriesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    materials: Array.from(allMaterialsSet).sort((a, b) => a.localeCompare(b)),
    priceRange: { min: priceMin, max: priceMax },
  };

  // ── Aplicar filtros sobre el catálogo cargado
  const catalogView = allActiveProducts
    .filter((p) => p.variants.length > 0)
    .map((product) => {
      const defaultVariant = product.variants[0];
      const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
      const materials = product.variants
        .map((v) => v.name)
        .filter((x): x is string => Boolean(x));
      const minVariantPrice = Math.min(
        ...product.variants.map((v) => Number(v.price)),
      );
      return {
        id: product.id,
        name: product.title,
        slug: product.slug,
        category: product.category?.name ?? "Accesorio",
        categorySlug: product.category?.slug ?? null,
        price: Number(defaultVariant.price),
        minVariantPrice,
        originalPrice: defaultVariant.compareAtPrice
          ? Number(defaultVariant.compareAtPrice)
          : undefined,
        material: defaultVariant.name ?? undefined,
        materials,
        stock: totalStock,
        variantCount: product.variants.length,
        image: product.images[0]?.url ?? "",
        rating: 5,
        reviewCount: 0,
        searchHaystack:
          `${product.title} ${product.description} ${product.category?.name ?? ""} ${materials.join(" ")}`.toLowerCase(),
      };
    })
    .filter((p) => {
      if (categorySlug && p.categorySlug !== categorySlug) return false;
      if (material && !p.materials.includes(material)) return false;
      if (
        maxPriceParam !== undefined &&
        !isNaN(maxPriceParam) &&
        maxPriceParam < facets.priceRange.max &&
        p.minVariantPrice > maxPriceParam
      )
        return false;
      if (q) {
        const needle = q.toLowerCase();
        if (!p.searchHaystack.includes(needle)) return false;
      }
      return true;
    });

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Catálogo de <span className="text-primary">Accesorios</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Descubre nuestra colección premium. Piezas artesanales diseñadas
            para resaltar tu esencia única.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full flex-shrink-0 lg:w-64">
            <Suspense
              fallback={
                <div className="h-64 w-full animate-pulse rounded-xl bg-card" />
              }
            >
              <ProductFilters facets={facets} />
            </Suspense>
          </aside>

          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {catalogView.length}
                </span>{" "}
                {catalogView.length === 1 ? "producto" : "productos"}
                {q && (
                  <>
                    {" "}
                    para &quot;
                    <span className="font-semibold text-foreground">{q}</span>
                    &quot;
                  </>
                )}
              </p>
            </div>

            {dbError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <p className="text-sm text-destructive">
                  Hubo un error al conectar con la base de datos. Verifica tus
                  credenciales en <strong>.env.local</strong>.
                </p>
              </div>
            ) : catalogView.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-foreground">
                  No se encontraron productos
                </h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Intenta ajustar los filtros o probar otra búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                {catalogView.map((product) => (
                  <ProductCard
                    key={product.id}
                    productId={product.id}
                    name={product.name}
                    slug={product.slug}
                    category={product.category}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    material={product.material}
                    stock={product.stock}
                    variantCount={product.variantCount}
                    image={product.image}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
