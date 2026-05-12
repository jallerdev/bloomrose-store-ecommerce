import Link from "next/link";

import { db } from "@/lib/db";
import { products as productsSchema, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { StoreHeader } from "@/components/StoreHeader";
import { FavoritesClient } from "./FavoritesClient";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Favoritos · Bloomrose" };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  // Cargamos TODOS los productos activos en una sola query con sus variantes
  // y la imagen principal. El cliente filtra contra la wishlist persistida.
  // Esto evita una query extra cada vez que el usuario agrega/quita un favorito,
  // y permite que el listado funcione tanto anónimo (localStorage) como autenticado.
  const allProducts = await db.query.products.findMany({
    where: eq(productsSchema.isActive, true),
    with: {
      category: true,
      variants: {
        where: eq(productVariants.isActive, true),
      },
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
        limit: 1,
      },
    },
  });

  const productsLite = allProducts
    .filter((p) => p.variants.length > 0)
    .map((p) => {
      const v = p.variants[0];
      const totalStock = p.variants.reduce((acc, x) => acc + x.stock, 0);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category?.name ?? "Accesorio",
        price: Number(v.price),
        originalPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        material: v.name ?? undefined,
        stock: totalStock,
        defaultVariantId: v.id,
        defaultVariantName: v.name ?? undefined,
        defaultVariantStock: v.stock,
        variantCount: p.variants.length,
        image: p.images[0]?.url ?? "",
      };
    });

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
              Mis favoritos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Las piezas que más te gustan, guardadas para después.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/productos">Seguir explorando</Link>
          </Button>
        </div>

        <FavoritesClient products={productsLite} />
      </div>
    </main>
  );
}
