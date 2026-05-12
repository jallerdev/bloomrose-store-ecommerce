"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const imageUrl = (formData.get("imageUrl") as string) || null;

  await db.insert(categories).values({
    name,
    slug,
    description,
    imageUrl,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/colecciones");
  revalidatePath("/");
  updateTag("categories");
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/colecciones");
  revalidatePath("/");
  updateTag("categories");
}

// ─── UPLOAD CATEGORY IMAGE ────────────────────────────────────────────────
// Sube la imagen al bucket `category-images` en Supabase Storage y devuelve
// la URL pública. El bucket debe existir en Supabase (Storage → New bucket
// → name "category-images", public: true).

export async function uploadCategoryImageAction(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "No se recibió ningún archivo." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen." };
  }
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_BYTES) {
    return { error: "La imagen no puede exceder 5MB." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `category-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("category-images")
    .upload(filename, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[uploadCategoryImageAction]", error);
    // Bucket missing → mensaje claro para el admin.
    if (
      error.message.toLowerCase().includes("bucket") &&
      error.message.toLowerCase().includes("not found")
    ) {
      return {
        error:
          "Falta crear el bucket 'category-images' en Supabase Storage (Dashboard → Storage → New bucket, public).",
      };
    }
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("category-images")
    .getPublicUrl(filename);

  return { url: urlData.publicUrl };
}
