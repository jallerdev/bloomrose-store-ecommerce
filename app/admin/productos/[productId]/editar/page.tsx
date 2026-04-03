import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminProductForm } from "../../AdminProductForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, categoriesList] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        variants: true,
        images: { orderBy: (i, { asc }) => [asc(i.displayOrder)] },
      },
    }),
    db.select({ id: categories.id, name: categories.name }).from(categories),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Productos
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-foreground">
          Editar Producto
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.title}</p>
      </div>
      <AdminProductForm categories={categoriesList} product={product} />
    </div>
  );
}
