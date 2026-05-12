import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import { ilike, desc, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { TableSearch } from "@/components/admin/TableSearch";
import { ProductsTableActions } from "@/app/admin/productos/ProductsTableActions";

export const metadata = { title: "Productos — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminProductosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim();

  const allProducts = await db.query.products.findMany({
    where: q
      ? or(ilike(products.title, `%${q}%`), ilike(products.slug, `%${q}%`))
      : undefined,
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
            {q ? "encontrados" : "en el catálogo"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <TableSearch placeholder="Buscar por nombre o slug..." />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] caption-bottom text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <Th>Producto</Th>
              <Th className="hidden sm:table-cell">Categoría</Th>
              <Th className="hidden md:table-cell">Variantes</Th>
              <Th className="hidden md:table-cell">Stock</Th>
              <Th className="hidden text-right lg:table-cell">Precio mín.</Th>
              <Th className="text-center">Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {q ? (
                      <p className="text-sm text-muted-foreground">
                        No encontramos productos para &quot;
                        <span className="font-medium text-foreground">{q}</span>
                        &quot;.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Aún no tienes productos.
                        </p>
                        <Link
                          href="/admin/productos/nuevo"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Crear el primero →
                        </Link>
                      </>
                    )}
                  </div>
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
                const stockColor =
                  totalStock === 0
                    ? "text-destructive"
                    : totalStock <= 10
                      ? "text-amber-600"
                      : "text-emerald-600";
                const primaryImage = product.images[0]?.url;

                return (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/productos/${product.id}/editar`}
                            className="line-clamp-1 font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {product.title}
                          </Link>
                          <p className="truncate font-mono text-[10px] text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 sm:table-cell">
                      {product.category?.name ? (
                        <Badge
                          variant="outline"
                          className="font-normal text-muted-foreground"
                        >
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-sm text-foreground">
                        {product.variants.length}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`text-sm font-medium ${stockColor}`}>
                        {totalStock}
                      </span>
                    </td>

                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      <span className="text-sm font-medium text-foreground">
                        {minPrice !== null ? fmtCOP(minPrice) : "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {product.isActive ? (
                        <Badge className="border-none bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Inactivo
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
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

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
