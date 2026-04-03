import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductsTableActions } from "@/app/admin/productos/ProductsTableActions";

export const metadata = { title: "Productos — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const allProducts = await db.query.products.findMany({
    with: {
      category: true,
      variants: true,
      images: {
        limit: 1,
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
    },
    orderBy: [desc(products.createdAt)],
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allProducts.length} producto{allProducts.length !== 1 ? "s" : ""}{" "}
            en el catálogo
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Producto
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                Categoría
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Variantes
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Precio mín.
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  No hay productos.{" "}
                  <Link
                    href="/admin/productos/nuevo"
                    className="text-primary hover:underline"
                  >
                    Crea el primero.
                  </Link>
                </td>
              </tr>
            ) : (
              allProducts.map((product) => {
                const minPrice =
                  product.variants.length > 0
                    ? Math.min(...product.variants.map((v) => Number(v.price)))
                    : null;
                const totalStock = product.variants.reduce(
                  (s, v) => s + v.stock,
                  0,
                );
                const primaryImage = product.images[0]?.url;

                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-secondary/20"
                  >
                    {/* Product name + image */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <span className="text-xs">—</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {product.category?.name || "—"}
                      </span>
                    </td>

                    {/* Variants count + stock */}
                    <td className="hidden px-4 py-3.5 md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">
                          {product.variants.length} variante
                          {product.variants.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalStock} en stock
                        </span>
                      </div>
                    </td>

                    {/* Min price */}
                    <td className="hidden px-4 py-3.5 text-right md:table-cell">
                      <span className="text-sm font-medium text-foreground">
                        {minPrice !== null
                          ? `$${minPrice.toLocaleString("es-MX")}`
                          : "—"}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      {product.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground"
                        >
                          Inactivo
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <ProductsTableActions
                        productId={product.id}
                        slug={product.slug}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
