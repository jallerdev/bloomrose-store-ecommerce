import Link from "next/link";
import Image from "next/image";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { Truck, RotateCcw, Shield, Gem, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Bloom Rose Accesorios",
  description:
    "Accesorios femeninos elegantes y artesanales. Aretes, collares, pulseras y mas.",
  keywords: ["Bloom Rose Accesorios", "Bloom Rose", "Accesorios"],
  icons: {
    icon: "/images/image.png",
  },
};

const featuredProducts = [
  {
    name: "Serpentine Gold Chain Necklace",
    category: "Jewelry",
    price: 68,
    rating: 4.8,
    reviewCount: 214,
    image: "/images/product-necklace.jpg",
    badge: "Bestseller",
    badgeVariant: "bestseller" as const,
  },
  {
    name: "Artisan Leather Tote",
    category: "Bags",
    price: 145,
    originalPrice: 195,
    rating: 4.6,
    reviewCount: 87,
    image: "/images/product-bag.jpg",
    badge: "Sale",
    badgeVariant: "sale" as const,
  },
  {
    name: "Cashmere Blend Silk Scarf",
    category: "Scarves",
    price: 89,
    rating: 4.7,
    reviewCount: 156,
    image: "/images/product-scarf.jpg",
    badge: "New",
    badgeVariant: "new" as const,
  },
  {
    name: "Riviera Cat-Eye Sunglasses",
    category: "Eyewear",
    price: 112,
    rating: 4.4,
    reviewCount: 63,
    image: "/images/product-sunglasses.jpg",
  },
];

const categories = [
  {
    name: "Aretes",
    image: "/products/earrings.jpg",
    count: 24,
  },
  {
    name: "Collares",
    image: "/products/necklace.jpg",
    count: 18,
  },
  {
    name: "Pulseras",
    image: "/products/bracelet.jpg",
    count: 12,
  },
  {
    name: "Anillos",
    image: "/products/ring.jpg",
    count: 15,
  },
];

const valueProps = [
  {
    icon: Truck,
    title: "Envio gratis",
    description: "En pedidos mayores a $299",
  },
  {
    icon: RotateCcw,
    title: "Devoluciones",
    description: "30 dias para cambios",
  },
  {
    icon: Shield,
    title: "Garantia",
    description: "6 meses en todas las piezas",
  },
  {
    icon: Gem,
    title: "Calidad artesanal",
    description: "Materiales premium seleccionados",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-12 sm:px-6 sm:py-20 lg:flex-row lg:gap-16 lg:px-8 lg:py-28">
          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-extra-wide text-primary sm:text-xs">
              Nueva Coleccion Primavera 2026
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Accesorios que cuentan{" "}
              <span className="text-primary">tu historia</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:mt-6">
              Piezas artesanales disenadas para resaltar tu esencia unica.
              Descubre nuestra coleccion de aretes, collares, pulseras y mucho
              mas.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:mt-8 lg:items-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-foreground px-8 text-sm font-medium tracking-wide text-background hover:bg-foreground/90"
              >
                <Link href="/productos">
                  Explorar Tienda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-border px-8 text-sm font-medium tracking-wide"
              >
                <Link href="/colecciones">Ver Colecciones</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative aspect-[3/4] w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl bg-secondary sm:max-w-sm lg:max-w-md">
            <Image
              src="/images/product-necklace.jpg"
              alt="Collar artesanal Bloom Rose"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 400px"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Categorias Destacadas ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                Comprar por Categoria
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Encuentra lo que buscas rapidamente
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
            {categories.map((cat) => (
              <Link
                key={cat.name}
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
                    {cat.count} productos
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Productos Destacados ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl text-foreground sm:text-2xl">
                Mas Populares
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Piezas seleccionadas por nuestra comunidad
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
            {featuredProducts.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Propuesta de Valor ── */}
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
              Se parte de nuestra comunidad
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
                Bloom Rose
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              © 2026 Bloom Rose. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
