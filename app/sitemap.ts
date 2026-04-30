import type { MetadataRoute } from "next";
import { eq, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories as categoriesSchema,
  products as productsSchema,
} from "@/lib/db/schema";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomroseaccesorios.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Páginas estáticas principales del storefront
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/nuevos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/colecciones`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/envios`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/devoluciones`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/cuidado-de-joyas`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Productos activos
  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await db
      .select({
        slug: productsSchema.slug,
        updatedAt: productsSchema.updatedAt,
      })
      .from(productsSchema)
      .where(eq(productsSchema.isActive, true))
      .orderBy(desc(productsSchema.updatedAt));

    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/productos/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const cats = await db
      .select({ slug: categoriesSchema.slug })
      .from(categoriesSchema);
    categoryRoutes = cats.map((c) => ({
      url: `${SITE_URL}/productos?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[sitemap] db read failed", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
