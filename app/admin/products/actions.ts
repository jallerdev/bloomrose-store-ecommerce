"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const material = formData.get("material") as string;
  const stock = formData.get("stock") as string;
  const isActive = formData.get("isActive") === "on";

  await db.insert(products).values({
    title,
    slug,
    description,
    price,
    imageUrl,
    categoryId,
    material,
    stock,
    isActive,
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const material = formData.get("material") as string;
  const stock = formData.get("stock") as string;
  const isActive = formData.get("isActive") === "on";

  await db
    .update(products)
    .set({
      title,
      slug,
      description,
      price,
      imageUrl,
      categoryId,
      material,
      stock,
      isActive,
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
