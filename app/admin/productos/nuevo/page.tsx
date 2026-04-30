import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { AdminProductForm } from "@/app/admin/productos/AdminProductForm";

export const metadata = { title: "Nuevo Producto — Admin Bloomrose" };

export default async function NuevoProductoPage() {
  const categoriesList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories);
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
          Nuevo Producto
        </h1>
      </div>
      <AdminProductForm categories={categoriesList} />
    </div>
  );
}
