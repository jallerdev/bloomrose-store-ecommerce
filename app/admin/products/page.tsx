import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { deleteProduct } from "./actions";

export const metadata = {
  title: "Admin - Productos",
};

export default async function AdminProductsPage() {
  const productsList = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  const categoriesList = await db.select().from(categories);

  const getCategoryName = (id: string | null) => {
    if (!id) return "N/A";
    const cat = categoriesList.find((c) => c.id === id);
    return cat ? cat.name : "N/A";
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-foreground">Productos</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          Añadir Producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-secondary/50 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productsList.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-secondary/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">
                    {product.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{product.slug}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getCategoryName(product.categoryId)}
                </td>
                <td className="px-6 py-4">${product.price}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${!product.isActive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {product.stock} {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteProduct(product.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
