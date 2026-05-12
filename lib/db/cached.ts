import { unstable_cache } from "next/cache";
import { and, avg, count, desc, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  categories as categoriesSchema,
  products as productsSchema,
  productVariants,
  reviews,
} from "@/lib/db/schema";

const PRODUCT_TAG = "products";
const CATEGORY_TAG = "categories";
const REVIEW_TAG = "reviews";

export const getFeaturedProducts = unstable_cache(
  async () => {
    return db.query.products.findMany({
      where: eq(productsSchema.isActive, true),
      with: {
        category: true,
        variants: { where: eq(productVariants.isActive, true) },
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
          limit: 1,
        },
      },
      orderBy: [desc(productsSchema.createdAt)],
      limit: 8,
    });
  },
  ["featured-products"],
  { tags: [PRODUCT_TAG], revalidate: 300 },
);

export const getHomeCategories = unstable_cache(
  async () => {
    return db
      .select({
        id: categoriesSchema.id,
        name: categoriesSchema.name,
        slug: categoriesSchema.slug,
        imageUrl: categoriesSchema.imageUrl,
        productCount: count(productsSchema.id),
      })
      .from(categoriesSchema)
      .leftJoin(
        productsSchema,
        eq(productsSchema.categoryId, categoriesSchema.id),
      )
      .groupBy(
        categoriesSchema.id,
        categoriesSchema.name,
        categoriesSchema.slug,
        categoriesSchema.imageUrl,
      )
      .orderBy(desc(count(productsSchema.id)));
  },
  ["home-categories"],
  { tags: [CATEGORY_TAG, PRODUCT_TAG], revalidate: 600 },
);

export const getCatalogProducts = unstable_cache(
  async () => {
    return db.query.products.findMany({
      where: eq(productsSchema.isActive, true),
      with: {
        category: true,
        variants: { where: eq(productVariants.isActive, true) },
        images: {
          orderBy: (images, { asc }) => [asc(images.displayOrder)],
          limit: 1,
        },
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });
  },
  ["catalog-products"],
  { tags: [PRODUCT_TAG], revalidate: 300 },
);

export function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      return db.query.products.findFirst({
        where: eq(productsSchema.slug, slug),
        with: {
          category: true,
          variants: { where: eq(productVariants.isActive, true) },
          images: { orderBy: (images, { asc }) => [asc(images.displayOrder)] },
        },
      });
    },
    ["product-by-slug", slug],
    { tags: [PRODUCT_TAG, `product:${slug}`], revalidate: 300 },
  )();
}

export function getProductReviewStats(productId: string) {
  return unstable_cache(
    async () => {
      const [stats] = await db
        .select({
          avgRating: avg(reviews.rating),
          total: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.productId, productId));
      return stats;
    },
    ["product-review-stats", productId],
    { tags: [REVIEW_TAG, `product:${productId}`], revalidate: 300 },
  )();
}

export function getRelatedProducts(productId: string, categoryId: string) {
  return unstable_cache(
    async () => {
      return db.query.products.findMany({
        where: and(
          eq(productsSchema.categoryId, categoryId),
          ne(productsSchema.id, productId),
          eq(productsSchema.isActive, true),
        ),
        with: {
          variants: { where: eq(productVariants.isActive, true) },
          images: {
            orderBy: (images, { asc }) => [asc(images.displayOrder)],
          },
        },
        limit: 4,
      });
    },
    ["related-products", productId],
    { tags: [PRODUCT_TAG], revalidate: 600 },
  )();
}

export const PRODUCT_CACHE_TAGS = {
  product: PRODUCT_TAG,
  category: CATEGORY_TAG,
  review: REVIEW_TAG,
} as const;
