import { Tag } from "lucide-react";
import { count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { createCategory } from "./actions";
import { CategoryDeleteButton } from "./CategoryDeleteButton";
import { CategoryImageUpload } from "./CategoryImageUpload";

export const metadata = { title: "Categorías — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug, categories.description)
    .orderBy(categories.name);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} categoría{rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <aside className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">
                Nueva categoría
              </h2>
              <p className="text-xs text-muted-foreground">
                Agrupa productos por estilo o tipo
              </p>
            </div>
          </div>

          <form action={createCategory} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Ej. Aretes"
                className="mt-1 h-10 border-border bg-background text-sm"
              />
            </div>
            <div>
              <Label htmlFor="slug" className="text-xs text-muted-foreground">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                required
                placeholder="aretes"
                className="mt-1 h-10 border-border bg-background font-mono text-sm"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Solo minúsculas, números y guiones.
              </p>
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-xs text-muted-foreground"
              >
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Opcional. Aparece en la página de categoría."
                className="mt-1 border-border bg-background text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Imagen de portada
              </Label>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Aparece en /colecciones y en el bloque de categorías del home.
              </p>
              <div className="mt-2">
                <CategoryImageUpload />
              </div>
            </div>
            <Button
              type="submit"
              className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
            >
              Crear categoría
            </Button>
          </form>
        </aside>

        {/* List */}
        <section className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aún no tienes categorías.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Categoría
                  </th>
                  <th className="hidden px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Productos
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((cat) => (
                  <tr
                    key={cat.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        /{cat.slug}
                      </p>
                    </td>
                    <td className="hidden max-w-xs px-4 py-3 sm:table-cell">
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {cat.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium tabular-nums ${
                          Number(cat.productCount) > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {Number(cat.productCount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CategoryDeleteButton id={cat.id} name={cat.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
