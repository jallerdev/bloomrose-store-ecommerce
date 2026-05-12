"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;

  await db.insert(categories).values({
    name,
    slug,
    description,
  });

  revalidatePath("/admin/categories");
  updateTag("categories");
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  updateTag("categories");
}
