import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";

import {
  getProductBySlug,
  getProductReviewStats,
  getRelatedProducts,
} from "@/lib/db/cached";

import { StoreHeader } from "@/components/StoreHeader";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductDetailsTabs } from "@/components/ProductDetailsTabs";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import("next").Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.description.length > 160
      ? product.description.slice(0, 157) + "…"
      : product.description;
  const path = `/productos/${product.slug}`;
  const image = product.images?.[0]?.url;

  return {
    title: product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: product.title,
      description,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [stats, related] = await Promise.all([
    getProductReviewStats(product.id),
    getRelatedProducts(product.id, product.categoryId),
  ]);

  const avgRating = stats?.avgRating ? Number(stats.avgRating) : 0;
  const reviewCount = stats?.total ? Number(stats.total) : 0;

  const primaryImage = product.images[0]?.url || "/placeholder.svg";
  const galleryImages = product.images.length > 0 ? product.images : [];

  // ── JSON-LD Product + BreadcrumbList ──────────────────────────
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomroseaccesorios.com";
  const productUrl = `${SITE_URL}/productos/${product.slug}`;
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const inStock = totalStock > 0;
  const prices = product.variants.map((v) => Number(v.price));
  const lowPrice = prices.length ? Math.min(...prices) : 0;
  const highPrice = prices.length ? Math.max(...prices) : 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: galleryImages.map((img) =>
      img.url.startsWith("http") ? img.url : `${SITE_URL}${img.url}`,
    ),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Bloomrose" },
    category: product.category?.name,
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount,
      },
    }),
    offers:
      product.variants.length === 1
        ? {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "COP",
            price: prices[0],
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          }
        : {
            "@type": "AggregateOffer",
            url: productUrl,
            priceCurrency: "COP",
            lowPrice,
            highPrice,
            offerCount: product.variants.length,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: `${SITE_URL}/productos`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${SITE_URL}/productos?category=${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd, breadcrumbJsonLd]),
        }}
      />
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
                const totalStock = p.variants.reduce(
                  (acc, x) => acc + x.stock,
                  0,
                );
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
                    stock={totalStock}
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
