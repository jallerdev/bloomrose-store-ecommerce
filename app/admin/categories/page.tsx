import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createCategory, deleteCategory } from "./actions";

export const metadata = {
  title: "Admin - Categorías",
};

export default async function AdminCategoriesPage() {
  const categoriesList = await db.select().from(categories);

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8 text-foreground">Categorías</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Form */}
        <div className="md:col-span-1 bg-card border-border border rounded-xl p-6 h-max">
          <h2 className="font-serif text-xl mb-4 text-foreground">
            Nueva Categoría
          </h2>
          <form action={createCategory} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                name="name"
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
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                name="description"
                className="w-full mt-1 p-3 bg-background border border-border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="h-10 bg-foreground text-background rounded-md font-medium px-4 mt-2 hover:bg-foreground/90 transition-colors"
            >
              Guardar Categoría
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-card border-border border rounded-xl overflow-hidden self-start">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-border bg-secondary/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categoriesList.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {cat.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{cat.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                    {cat.description || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form
                      action={async () => {
                        "use server";
                        await deleteCategory(cat.id);
                      }}
                    >
                      <button className="text-red-500 hover:text-red-700 font-medium transition-colors">
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
    </div>
  );
}
