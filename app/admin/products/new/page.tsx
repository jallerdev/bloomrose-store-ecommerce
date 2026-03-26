import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createProduct } from "../actions";
import Link from "next/link";

export default async function NewProductPage() {
  const categoriesList = await db.select().from(categories);

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground"
        >
          &larr; Volver
        </Link>
        <h1 className="font-serif text-3xl text-foreground">Añadir Producto</h1>
      </div>

      <div className="bg-card border-border border rounded-xl p-6">
        <form action={createProduct} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Título</label>
              <input
                name="title"
                required
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <input
                name="slug"
                required
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <select
                name="categoryId"
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              >
                <option value="">Seleccione...</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Material</label>
              <input
                name="material"
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Precio ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stock Inicial</label>
              <input
                name="stock"
                type="number"
                defaultValue="0"
                required
                className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">URL de Imagen</label>
            <input
              name="imageUrl"
              className="w-full mt-1 h-10 px-3 bg-background border border-border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              name="description"
              rows={4}
              className="w-full mt-1 p-3 bg-background border border-border rounded-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Producto Activo
            </label>
          </div>

          <button
            type="submit"
            className="h-12 bg-foreground text-background mt-4 rounded-xl font-medium tracking-wide hover:bg-foreground/90 transition-colors"
          >
            Guardar Producto
          </button>
        </form>
      </div>
    </div>
  );
}
