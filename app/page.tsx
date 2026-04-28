import Link from "next/link";
import Image from "next/image";
import { Truck, RotateCcw, Shield, Gem, ArrowRight } from "lucide-react";
import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories as categoriesSchema,
  products as productsSchema,
  productVariants,
} from "@/lib/db/schema";

import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Bloomrose · Bisutería y accesorios artesanales",
  description:
    "Accesorios artesanales para resaltar tu esencia única. Aretes, collares, pulseras, anillos y más, con envíos a toda Colombia.",
  keywords: ["Bloomrose", "bisutería", "accesorios", "joyería artesanal"],
  icons: { icon: "/images/image.png" },
};

export const dynamic = "force-dynamic";

const valueProps = [
  {
    icon: Truck,
    title: "Envío gratis",
    description: "En pedidos sobre $200.000",
  },
  {
    icon: RotateCcw,
    title: "Devoluciones",
    description: "30 días para cambios",
  },
  {
    icon: Shield,
    title: "Garantía",
    description: "6 meses en todas las piezas",
  },
  {
    icon: Gem,
    title: "Calidad artesanal",
    description: "Materiales premium seleccionados",
  },
];

const NEW_BADGE_DAYS = 30;

export default async function HomePage() {
  // Productos destacados: 4 más recientes activos con al menos una variante activa.
  const recentProducts = await db.query.products.findMany({
    where: eq(productsSchema.isActive, true),
    with: {
      category: true,
      variants: { where: eq(productVariants.isActive, true) },
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
        limit: 1,
      },
    },
    orderBy: [desc(productsSchema.createdAt)],
    limit: 8, // pedimos un poco más por si alguno no tiene variantes y lo descartamos
  });

  const now = Date.now();
  const featuredProducts = recentProducts
    .filter((p) => p.variants.length > 0)
    .slice(0, 4)
    .map((p) => {
      const v = p.variants[0];
      const hasDiscount =
        v.compareAtPrice && Number(v.compareAtPrice) > Number(v.price);
      const isNew =
        now - new Date(p.createdAt).getTime() <
        NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
      const badge = hasDiscount
        ? { label: "Oferta", variant: "sale" as const }
        : isNew
          ? { label: "Nuevo", variant: "new" as const }
          : null;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category?.name ?? "Accesorio",
        price: Number(v.price),
        originalPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        material: v.name ?? undefined,
        stock: v.stock,
        variantCount: p.variants.length,
        image: p.images[0]?.url ?? "",
        badge,
      };
    });

  // Categorías reales con conteo de productos activos.
  const categoryRows = await db
    .select({
      id: categoriesSchema.id,
      name: categoriesSchema.name,
      slug: categoriesSchema.slug,
      imageUrl: categoriesSchema.imageUrl,
      productCount: count(productsSchema.id),
    })
    .from(categoriesSchema)
    .leftJoin(
      productsSchema,
      eq(productsSchema.categoryId, categoriesSchema.id),
    )
    .groupBy(categoriesSchema.id, categoriesSchema.name, categoriesSchema.slug, categoriesSchema.imageUrl)
    .orderBy(desc(count(productsSchema.id)));

  // Si la categoría no tiene imageUrl propia, usamos un fallback por slug.
  const categoryImageFallback: Record<string, string> = {
    aretes: "/products/earrings.jpg",
    collares: "/products/necklace.jpg",
    pulseras: "/products/bracelet.jpg",
    anillos: "/products/ring.jpg",
  };

  const homeCategories = categoryRows
    .filter((c) => Number(c.productCount) > 0)
    .slice(0, 4)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      image:
        c.imageUrl ||
        categoryImageFallback[c.slug] ||
        "/placeholder.svg",
      count: Number(c.productCount),
    }));

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-12 sm:px-6 sm:py-20 lg:flex-row lg:gap-16 lg:px-8 lg:py-28">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-extra-wide text-primary sm:text-xs">
              Nueva colección 2026
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Accesorios que cuentan{" "}
              <span className="text-primary">tu historia</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mt-6">
              Piezas artesanales diseñadas para resaltar tu esencia única.
              Descubre nuestra colección de aretes, collares, pulseras y mucho
              más.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:mt-8 lg:items-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-foreground px-8 text-sm font-medium tracking-wide text-background hover:bg-foreground/90"
              >
                <Link href="/productos">
                  Explorar tienda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border px-8 text-sm font-medium tracking-wide"
              >
                <Link href="/colecciones">Ver colecciones</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[3/4] w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl bg-secondary sm:max-w-sm lg:max-w-md">
            <Image
              src="/images/product-necklace.jpg"
              alt="Collar artesanal Bloomrose"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 400px"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Categorías destacadas ── */}
      {homeCategories.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                  Comprar por categoría
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Encuentra lo que buscas rápidamente
                </p>
              </div>
              <Link
                href="/productos"
                className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline sm:text-sm"
              >
                Ver todo
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {homeCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href="/productos"
                  className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-sm font-semibold text-white sm:text-base">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-white/70 sm:text-xs">
                      {cat.count} producto{cat.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Productos destacados ── */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                  Recién llegados
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Las piezas más recientes de nuestra colección
                </p>
              </div>
              <Link
                href="/productos"
                className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline sm:text-sm"
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {featuredProducts.map((p) => (
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
                  badge={p.badge?.label}
                  badgeVariant={p.badge?.variant}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Propuesta de valor ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <prop.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {prop.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="font-serif text-2xl text-background sm:text-3xl lg:text-4xl">
              Sé parte de nuestra comunidad
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-background/70">
              Recibe acceso anticipado a nuevos lanzamientos, promociones
              exclusivas y tips de estilo directamente en tu correo.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="tu@email.com"
                className="h-12 flex-1 rounded-xl border-0 bg-background/10 px-4 text-sm text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="lg"
                className="h-12 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/image.png"
                alt=""
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="font-serif text-base text-foreground">
                Bloomrose
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Bloomrose. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
