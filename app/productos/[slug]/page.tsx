import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";
import { eq, and, ne, avg, count } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  products as productsSchema,
  productVariants,
  reviews,
} from "@/lib/db/schema";

import { StoreHeader } from "@/components/StoreHeader";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductDetailsTabs } from "@/components/ProductDetailsTabs";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(productsSchema.slug, slug),
  });
  if (!product) return { title: "Producto no encontrado · Bloomrose" };
  return {
    title: `${product.title} · Bloomrose`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(productsSchema.slug, slug),
    with: {
      category: true,
      variants: { where: eq(productVariants.isActive, true) },
      images: { orderBy: (images, { asc }) => [asc(images.displayOrder)] },
    },
  });

  if (!product) notFound();

  // Estadística de reseñas (avg + count) — sin traer toda la lista aquí
  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      total: count(reviews.id),
    })
    .from(reviews)
    .where(eq(reviews.productId, product.id));

  const avgRating = stats?.avgRating ? Number(stats.avgRating) : 0;
  const reviewCount = stats?.total ? Number(stats.total) : 0;

  // Productos relacionados de la misma categoría (excluyendo el actual)
  const related = await db.query.products.findMany({
    where: and(
      eq(productsSchema.categoryId, product.categoryId),
      ne(productsSchema.id, product.id),
      eq(productsSchema.isActive, true),
    ),
    with: {
      variants: { where: eq(productVariants.isActive, true) },
      images: { orderBy: (images, { asc }) => [asc(images.displayOrder)] },
    },
    limit: 4,
  });

  const primaryImage = product.images[0]?.url || "/placeholder.svg";
  const galleryImages = product.images.length > 0 ? product.images : [];

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Migas de pan"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/productos"
            className="transition-colors hover:text-foreground"
          >
            Productos
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">
            {product.category?.name ?? "Catálogo"}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 max-w-[200px] text-foreground">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          {/* Galería */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary shadow-sm">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary transition-colors hover:border-foreground"
                    aria-label={`Vista ${i + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.title} — vista ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalles + selector */}
          <div className="flex flex-col gap-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {product.category?.name ?? "Catálogo"}
            </p>
            <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {product.title}
            </h1>

            {/* Rating compacto */}
            <a
              href="#resenas"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(avgRating)
                        ? "h-4 w-4 fill-amber-400 text-amber-400"
                        : "h-4 w-4 fill-muted text-muted"
                    }
                  />
                ))}
              </div>
              {reviewCount > 0 ? (
                <span>
                  {avgRating.toFixed(1)} · {reviewCount}{" "}
                  {reviewCount === 1 ? "reseña" : "reseñas"}
                </span>
              ) : (
                <span>Sin reseñas todavía</span>
              )}
            </a>

            <ProductDetailClient
              product={{
                id: product.id,
                title: product.title,
                images: product.images.map((i) => ({ url: i.url })),
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                name: v.name,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock,
              }))}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <ProductDetailsTabs
            description={product.description}
            category={product.category?.name ?? "Catálogo"}
            variants={product.variants.map((v) => ({
              sku: v.sku,
              name: v.name,
              weightGrams: v.weightGrams,
              lengthCm: v.lengthCm,
              widthCm: v.widthCm,
              heightCm: v.heightCm,
            }))}
          />
        </div>

        {/* Reseñas */}
        <div className="mt-16">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>

        {/* Productos relacionados */}
        {related.length > 0 && (
          <section
            aria-label="Productos relacionados"
            className="mt-16 border-t border-border pt-12"
          >
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
                  También te puede gustar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Piezas seleccionadas para complementar tu estilo.
                </p>
              </div>
              <Link
                href="/productos"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver catálogo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {related.map((p) => {
                const v = p.variants[0];
                if (!v) return null;
                return (
                  <ProductCard
                    key={p.id}
                    productId={p.id}
                    name={p.title}
                    slug={p.slug}
                    category={product.category?.name ?? "Accesorio"}
                    price={Number(v.price)}
                    originalPrice={
                      v.compareAtPrice ? Number(v.compareAtPrice) : undefined
                    }
                    material={v.name ?? undefined}
                    stock={v.stock}
                    variantCount={p.variants.length}
                    image={p.images[0]?.url ?? ""}
                    rating={5}
                    reviewCount={0}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
