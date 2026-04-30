import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  RotateCcw,
  Shield,
  Gem,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
  Globe2,
  Instagram,
  Quote,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export const metadata = {
  // Title del root layout aplica por defecto. Especificamos uno propio para que
  // la home tenga un título descriptivo en SERPs.
  title: {
    absolute: "Bloomrose Accesorios · Bisutería artesanal hecha en Colombia",
  },
  description:
    "Accesorios artesanales para resaltar tu esencia única. Aretes, collares, pulseras, anillos y más, con envíos a toda Colombia.",
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const valueProps = [
  {
    icon: Truck,
    title: "Envío gratis",
    description: "En pedidos sobre $200.000 a toda Colombia",
  },
  {
    icon: RotateCcw,
    title: "30 días para cambiar",
    description: "Cambios y devoluciones sin preguntas",
  },
  {
    icon: Shield,
    title: "Garantía de 6 meses",
    description: "Respaldamos cada pieza que enviamos",
  },
  {
    icon: Gem,
    title: "Calidad artesanal",
    description: "Materiales seleccionados a mano",
  },
];

const promesa = [
  {
    icon: Heart,
    title: "Hecho con cariño",
    description:
      "Cada pieza pasa por las manos de nuestras artesanas en Colombia.",
  },
  {
    icon: Globe2,
    title: "Materiales responsables",
    description:
      "Trabajamos con proveedores éticos y materiales libres de níquel.",
  },
  {
    icon: Sparkles,
    title: "Diseño que perdura",
    description:
      "Piezas atemporales pensadas para acompañarte por años, no por temporadas.",
  },
];

const testimonials = [
  {
    quote:
      "Pedí los aretes Luna Pearl Drop y llegaron en 2 días, mejor empacados que cualquier marca grande. La calidad es real.",
    name: "Valentina M.",
    location: "Bogotá",
    rating: 5,
  },
  {
    quote:
      "Compré un collar para mi mamá y se enamoró. Pedí otro al día siguiente. La atención por WhatsApp fue divina.",
    name: "Camila R.",
    location: "Medellín",
    rating: 5,
  },
  {
    quote:
      "Ya tengo tres piezas Bloomrose. No se me han oscurecido ni un poco con el tiempo. Vale cada peso.",
    name: "Daniela P.",
    location: "Cali",
    rating: 5,
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
    limit: 8,
  });

  const now = Date.now();
  const featuredProducts = recentProducts
    .filter((p) => p.variants.length > 0)
    .slice(0, 4)
    .map((p) => {
      const v = p.variants[0];
      const totalStock = p.variants.reduce((acc, x) => acc + x.stock, 0);
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
        stock: totalStock,
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
    .groupBy(
      categoriesSchema.id,
      categoriesSchema.name,
      categoriesSchema.slug,
      categoriesSchema.imageUrl,
    )
    .orderBy(desc(count(productsSchema.id)));

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
        c.imageUrl || categoryImageFallback[c.slug] || "/placeholder.svg",
      count: Number(c.productCount),
    }));

  return (
    <main className="min-h-screen bg-background">
      {/* ── Promo strip ── */}
      <div className="hidden border-b border-border/60 bg-foreground/95 py-2 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-8 gap-y-1 px-4 text-[11px] tracking-wide text-background/80 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3 w-3" /> Envío gratis sobre $200.000
          </span>
          <span className="hidden h-3 w-px bg-background/30 sm:block" />
          <span className="hidden md:inline-flex md:items-center md:gap-1.5">
            <Shield className="h-3 w-3" /> Pago seguro con Wompi
          </span>
          <span className="hidden h-3 w-px bg-background/30 md:block" />
          <span className="hidden lg:inline-flex lg:items-center lg:gap-1.5">
            <RotateCcw className="h-3 w-3" /> 30 días de cambio
          </span>
        </div>
      </div>

      <StoreHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        {/* Background decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(circle_at_85%_75%,hsl(var(--accent)/0.18),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:flex-row lg:gap-16 lg:px-8 lg:py-28">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-extra-wide text-primary sm:text-xs">
              <Sparkles className="h-3 w-3" />
              Nueva colección 2026
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              Accesorios que
              <br className="hidden sm:block" />{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">cuentan</span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-primary/20"
                />
              </span>{" "}
              tu historia
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:mt-7">
              Piezas artesanales diseñadas para resaltar tu esencia única.
              Descubre nuestra colección de aretes, collares, pulseras y mucho
              más — hechas en Colombia, con cariño.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-foreground px-8 text-sm font-medium tracking-wide text-background shadow-lg shadow-primary/10 hover:bg-foreground/90"
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
                className="h-12 rounded-xl border-border bg-background/60 px-8 text-sm font-medium tracking-wide backdrop-blur"
              >
                <Link href="/colecciones">Ver colecciones</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex flex-col items-center gap-4 text-xs text-muted-foreground sm:flex-row sm:gap-6 lg:items-start lg:justify-start lg:text-left">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">4.9</strong> · cientos de
                  clientas felices
                </span>
              </div>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-primary" />
                Hecho a mano en Colombia
              </span>
            </div>
          </div>

          {/* Hero Image with decorative frame */}
          <div className="relative w-full max-w-xs flex-shrink-0 sm:max-w-sm lg:max-w-md">
            {/* Offset frame behind */}
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-2xl border-2 border-primary/40 sm:block"
            />
            {/* Sparkle decorations */}
            <Sparkles
              aria-hidden
              className="absolute -left-3 -top-3 h-7 w-7 rotate-12 text-primary/60"
            />
            <Sparkles
              aria-hidden
              className="absolute -right-2 bottom-10 hidden h-5 w-5 -rotate-12 text-accent sm:block"
            />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary shadow-xl shadow-primary/10">
              <Image
                src="/images/product-necklace.jpg"
                alt="Collar artesanal Bloomrose"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 400px"
                priority
              />
            </div>

            {/* Floating chip */}
            <div className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 shadow-md sm:flex sm:items-center sm:gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                <Gem className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-xs font-medium text-foreground">
                Pieza del mes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      {homeCategories.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <SectionHeader
              eyebrow="Catálogo"
              title="Comprar por categoría"
              subtitle="Encuentra lo que buscas rápidamente"
              actionHref="/productos"
              actionLabel="Ver todo"
            />

            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {homeCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href="/productos"
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                    <div>
                      <h3 className="font-serif text-base text-white sm:text-lg">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-white/75 sm:text-xs">
                        {cat.count} producto{cat.count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Productos destacados ── */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <SectionHeader
              eyebrow="Recién llegados"
              title="Las novedades de la temporada"
              subtitle="Las piezas más recientes de nuestra colección"
              actionHref="/productos"
              actionLabel="Ver todos"
            />

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
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

      {/* ── Promesa Bloomrose ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-extra-wide text-primary">
              La promesa Bloomrose
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl">
              Más que accesorios:{" "}
              <span className="italic text-primary">historias que se llevan puestas</span>
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            {promesa.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Propuesta de valor ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-background/40 p-5 transition-all hover:border-primary/40 hover:bg-background"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <prop.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {prop.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {prop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeader
            eyebrow="Lo que dicen nuestras clientas"
            title="Confían en Bloomrose"
            subtitle="Reseñas reales de quienes ya viven la experiencia"
            center
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className={cn(
                  "relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm",
                  i === 1 &&
                    "md:scale-[1.02] md:border-primary/30 md:shadow-md md:shadow-primary/10",
                )}
              >
                <Quote
                  aria-hidden
                  className="absolute right-5 top-5 h-6 w-6 text-primary/15"
                />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
                    {t.name[0]}
                  </span>
                  <div className="text-xs">
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.location}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Newsletter ── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-secondary via-card to-card px-6 py-14 sm:px-12 sm:py-20">
            {/* Decorative blobs */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
            />

            <div className="relative mx-auto max-w-xl text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-card/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-extra-wide text-primary backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Comunidad Bloomrose
              </div>
              <h2 className="font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
                Sé la primera en enterarte
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Lanzamientos, drops privados y promociones que solo enviamos a
                nuestra lista. Cero spam, lo prometemos.
              </p>
              <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl bg-foreground px-8 text-sm font-medium text-background hover:bg-foreground/90"
                >
                  Suscribirme
                </Button>
              </form>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Al suscribirte aceptas recibir correos ocasionales. Te puedes
                dar de baja cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/image.png"
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="font-serif text-base text-foreground">
                  Bloomrose
                </span>
              </div>
              <p className="mt-3 max-w-xs text-xs text-muted-foreground">
                Bisutería artesanal hecha en Colombia. Piezas para mujeres que
                cuentan su propia historia.
              </p>
              <a
                href="#"
                aria-label="Instagram"
                className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>

            <FooterColumn
              title="Tienda"
              links={[
                { label: "Catálogo", href: "/productos" },
                { label: "Nuevos", href: "/nuevos" },
                { label: "Colecciones", href: "/colecciones" },
                { label: "Favoritos", href: "/favoritos" },
              ]}
            />
            <FooterColumn
              title="Bloomrose"
              links={[
                { label: "Nosotros", href: "/nosotros" },
                { label: "Mi cuenta", href: "/perfil" },
                { label: "Mis pedidos", href: "/perfil/pedidos" },
              ]}
            />
            <FooterColumn
              title="Ayuda"
              links={[
                { label: "Envíos", href: "#" },
                { label: "Devoluciones", href: "#" },
                { label: "Cuidado de joyas", href: "#" },
                { label: "Contacto", href: "#" },
              ]}
            />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Bloomrose. Todos los derechos
              reservados.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Hecho con cariño en Colombia
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionHref,
  actionLabel,
  center = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        center && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={cn(center && "sm:mx-auto sm:max-w-xl")}>
        <p className="text-[10px] font-semibold uppercase tracking-extra-wide text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div
          aria-hidden
          className={cn(
            "mt-3 h-px w-12 bg-primary/40",
            center && "sm:mx-auto",
          )}
        />
      </div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline sm:self-end sm:text-sm"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h4>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
