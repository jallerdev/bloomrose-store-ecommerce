import { db } from "@/lib/db";
import { products as productsSchema, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo — Bloom Rose Accesorios",
  description:
    "Explora nuestra colección de accesorios artesanales: aretes, collares, pulseras y más.",
};

export default async function ProductosPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const material =
    typeof params.material === "string" ? params.material : undefined;
  const maxPrice =
    typeof params.maxPrice === "string"
      ? parseFloat(params.maxPrice)
      : undefined;

  let productsData: any[] = [];
  let error = null;

  try {
    productsData = await db.query.products.findMany({
      where: eq(productsSchema.isActive, true),
      with: {
        category: true,
        variants: {
          where: eq(productVariants.isActive, true),
        },
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
        },
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });
  } catch (err) {
    error = err;
    console.error("Database fetch error in products catalog", err);
  }

  const catalogView = productsData
    .filter((p) => p.variants && p.variants.length > 0)
    .map((product) => {
      const defaultVariant = product.variants[0];
      const defaultImage = product.images?.[0]?.url || "";
      return {
        id: product.id,
        name: product.title,
        slug: product.slug,
        category: product.category?.name || "Accesorio",
        price: Number(defaultVariant.price),
        material: defaultVariant.name,
        image: defaultImage,
        rating: 5,
        reviewCount: 12,
      };
    })
    .filter((p) => {
      if (material && p.material !== material) return false;
      if (maxPrice && !isNaN(maxPrice) && p.price > maxPrice) return false;
      return true;
    });

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* Page Header */}
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

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 lg:w-64">
            <ProductFilters />
          </aside>

          {/* Products Grid */}
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {catalogView.length}
                </span>{" "}
                productos
              </p>
            </div>

            {error ? (
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
                  Intenta ajustar los filtros para visualizar otros resultados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                {catalogView.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    slug={product.slug}
                    category={product.category}
                    price={product.price}
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
