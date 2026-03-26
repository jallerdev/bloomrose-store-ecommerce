import { db } from "@/lib/db";
import { products as productsSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductClient } from "./ProductClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return { title: `${resolvedParams.slug} - Bloom Rose Accesorios` };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  const results = await db
    .select()
    .from(productsSchema)
    .where(eq(productsSchema.slug, resolvedParams.slug))
    .limit(1);

  const product = results[0];

  if (!product) {
    notFound();
  }

  // Pre-process for UI
  const productData = {
    id: product.id,
    sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
    title: product.title,
    slug: product.slug,
    price: Number(product.price),
    description: product.description || "Sin descripción proporcionada.",
    imageUrl: product.imageUrl,
    category: product.material || "Accesorio",
    stock: product.stock,
  };

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <ProductClient product={productData} />
    </main>
  );
}
