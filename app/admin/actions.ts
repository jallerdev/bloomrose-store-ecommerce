"use server";

import { db } from "@/lib/db";
import { products, productVariants, productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteProductAction(productId: string) {
  try {
    await db.delete(products).where(eq(products.id, productId));
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (err) {
    console.error("deleteProductAction error:", err);
    return { error: "No se pudo eliminar el producto." };
  }
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createProductAction(data: {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  variants: { sku: string; name: string; price: number; stock: number }[];
  imageUrls: string[];
}) {
  try {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...data,
      })
      .returning({ id: products.id });

    if (data.variants.length > 0) {
      await db.insert(productVariants).values(
        data.variants.map((v) => ({
          ...v,
          productId: newProduct.id,
          price: v.price.toString(),
        })),
      );
    }

    if (data.imageUrls.length > 0) {
      await db.insert(productImages).values(
        data.imageUrls.map((url, i) => ({
          productId: newProduct.id,
          url,
          displayOrder: i,
        })),
      );
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
  } catch (err: any) {
    console.error("createProductAction error:", err);
    return { error: err?.message || "Error al crear el producto." };
  }

  redirect("/admin/productos");
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateProductAction(
  productId: string,
  data: {
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    isActive: boolean;
    variants: {
      id?: string;
      sku: string;
      name: string;
      price: number;
      stock: number;
    }[];
    imageUrls: string[];
  },
) {
  try {
    await db
      .update(products)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    // Delete all old variants and re-insert (simplest idempotent approach)
    await db
      .delete(productVariants)
      .where(eq(productVariants.productId, productId));
    if (data.variants.length > 0) {
      await db.insert(productVariants).values(
        data.variants.map((v) => ({
          productId,
          sku: v.sku,
          name: v.name,
          price: v.price.toString(),
          stock: v.stock,
        })),
      );
    }

    // Replace images
    await db
      .delete(productImages)
      .where(eq(productImages.productId, productId));
    if (data.imageUrls.length > 0) {
      await db.insert(productImages).values(
        data.imageUrls.map((url, i) => ({
          productId,
          url,
          displayOrder: i,
        })),
      );
    }

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath(`/productos/${data.slug}`);
  } catch (err: any) {
    console.error("updateProductAction error:", err);
    return { error: err?.message || "Error al actualizar el producto." };
  }

  redirect("/admin/productos");
}

// ─── UPLOAD IMAGE ─────────────────────────────────────────────────────────────

export async function uploadProductImageAction(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file || file.size === 0)
    return { error: "No se recibió ningún archivo." };

  const ext = file.name.split(".").pop();
  const filename = `product-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, file, { upsert: true });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return { url: urlData.publicUrl };
}
