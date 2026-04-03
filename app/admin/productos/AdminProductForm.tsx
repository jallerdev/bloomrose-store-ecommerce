"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProductAction,
  updateProductAction,
  uploadProductImageAction,
} from "@/app/admin/actions";

// ─── Schema ───────────────────────────────────────────────────────────────────

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Requerido"),
  sku: z.string().min(1, "Requerido"),
  price: z.coerce.number().min(0.01, "Precio inválido"),
  stock: z.coerce.number().int().min(0, "Stock inválido"),
});

const productSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  categoryId: z.string().uuid("Selecciona una categoría"),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "Agrega al menos una variante"),
});

type ProductFormData = z.infer<typeof productSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminProductFormProps {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    isActive: boolean;
    variants: {
      id: string;
      sku: string;
      name: string | null;
      price: string;
      stock: number;
    }[];
    images: { id: string; url: string; displayOrder: number }[];
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminProductForm({
  categories,
  product,
}: AdminProductFormProps) {
  const isEditing = !!product;
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images.map((i) => i.url) ?? [],
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      isActive: product?.isActive ?? true,
      variants: product?.variants.map((v) => ({
        id: v.id,
        name: v.name ?? "",
        sku: v.sku,
        price: Number(v.price),
        stock: v.stock,
      })) ?? [{ name: "", sku: "", price: 0, stock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Auto-generate slug from title
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue("title", e.target.value);
    if (!isEditing) {
      const slug = e.target.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  }

  // Image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setIsUploading(true);

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImageAction(fd);
      if (result.error) {
        toast.error(`Error al subir ${file.name}: ${result.error}`);
      } else if (result.url) {
        setImageUrls((prev) => [...prev, result.url!]);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  // Submit
  function onSubmit(data: ProductFormData) {
    startTransition(async () => {
      const payload = { ...data, imageUrls };
      const result = isEditing
        ? await updateProductAction(product!.id, payload)
        : await createProductAction(payload);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Producto actualizado." : "Producto creado.");
      }
    });
  }

  const inputClass =
    "w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50";
  const labelClass = "text-xs font-medium text-muted-foreground";

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Left column */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Basic Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">
            Información básica
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <Label className={labelClass}>Título *</Label>
              <input
                {...form.register("title")}
                onChange={handleTitleChange}
                placeholder="Ej: Aretes de Perla Luna"
                className={inputClass + " mt-1"}
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label className={labelClass}>Slug (URL) *</Label>
              <input
                {...form.register("slug")}
                placeholder="ej: aretes-de-perla-luna"
                className={inputClass + " mt-1 font-mono text-xs"}
              />
              {form.formState.errors.slug && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <Label className={labelClass}>Descripción *</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Describe el producto..."
                rows={4}
                className="mt-1 resize-none border-border bg-background text-sm"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label className={labelClass}>Categoría *</Label>
              <select
                {...form.register("categoryId")}
                className={inputClass + " mt-1"}
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-foreground">Variantes</h2>
              <p className="text-xs text-muted-foreground">
                Precio, SKU y stock por variante.
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({ name: "", sku: "", price: 0, stock: 0 })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          </div>

          {form.formState.errors.variants?.root && (
            <p className="mb-3 text-xs text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Variante {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <Label className={labelClass}>Nombre</Label>
                    <input
                      {...form.register(`variants.${index}.name`)}
                      placeholder="Ej: Baño de Oro"
                      className={inputClass + " mt-1"}
                    />
                    {form.formState.errors.variants?.[index]?.name && (
                      <p className="mt-0.5 text-xs text-destructive">
                        {form.formState.errors.variants[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className={labelClass}>SKU</Label>
                    <input
                      {...form.register(`variants.${index}.sku`)}
                      placeholder="ARK-001"
                      className={inputClass + " mt-1 font-mono text-xs"}
                    />
                    {form.formState.errors.variants?.[index]?.sku && (
                      <p className="mt-0.5 text-xs text-destructive">
                        {form.formState.errors.variants[index]?.sku?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className={labelClass}>Precio ($)</Label>
                    <input
                      type="number"
                      step="0.01"
                      {...form.register(`variants.${index}.price`)}
                      className={inputClass + " mt-1"}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className={labelClass}>Stock</Label>
                    <input
                      type="number"
                      {...form.register(`variants.${index}.stock`)}
                      className={inputClass + " mt-1"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {/* Images */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">Imágenes</h2>

          {imageUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {imageUrls.map((url) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/30"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
            <span>
              {isUploading ? "Subiendo..." : "Haz clic o arrastra imágenes"}
            </span>
            <span className="text-xs">PNG, JPG, WebP · Máx 5MB</span>
          </label>
        </section>

        {/* Status & Submit */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg text-foreground">Estado</h2>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Producto activo
              </p>
              <p className="text-xs text-muted-foreground">
                Visible en el catálogo público
              </p>
            </div>
            <input
              type="checkbox"
              {...form.register("isActive")}
              className="peer sr-only"
            />
            <div className="relative h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
          </label>
        </section>

        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : isEditing ? (
            "Actualizar Producto"
          ) : (
            "Crear Producto"
          )}
        </Button>
      </div>
    </form>
  );
}
