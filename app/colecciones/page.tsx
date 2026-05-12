import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";

import { StoreHeader } from "@/components/StoreHeader";
import { getHomeCategories } from "@/lib/db/cached";

export const metadata = {
  title: "Colecciones — Bloom Rose Accesorios",
  description:
    "Explora nuestras colecciones curadas de accesorios artesanales para cada ocasión y estilo.",
  alternates: { canonical: "/colecciones" },
};

export default async function ColeccionesPage() {
  const rows = await getHomeCategories();

  // Solo mostramos colecciones con al menos un producto activo.
  // image viene de Supabase Storage vía `categories.imageUrl`. Si la
  // categoría aún no tiene imagen subida, el card renderiza un placeholder.
  const collections = rows
    .filter((c) => Number(c.productCount) > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.imageUrl ?? null,
      count: Number(c.productCount),
    }));

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Nuestras{" "}
            <span className="font-brand text-4xl text-primary sm:text-5xl lg:text-6xl">
              Colecciones
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Cada categoría reúne piezas seleccionadas a mano. Encuentra la que
            resuene con tu estilo.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aún no hay colecciones con productos disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/productos?category=${encodeURIComponent(collection.slug)}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/40">
                        <span className="font-brand text-4xl text-primary/40 sm:text-5xl">
                          {collection.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-serif text-lg text-foreground">
                        {collection.name}
                      </h2>
                      <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                        {collection.count}{" "}
                        {collection.count === 1 ? "pieza" : "piezas"}
                      </span>
                    </div>
                    {collection.description && (
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {collection.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors group-hover:text-foreground">
                      Explorar colección
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
