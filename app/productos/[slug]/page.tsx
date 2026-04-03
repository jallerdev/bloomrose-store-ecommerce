import { db } from "@/lib/db";
import { products as productsSchema, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import Image from "next/image";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(productsSchema.slug, slug),
    with: {
      category: true,
      variants: {
        where: eq(productVariants.isActive, true),
      },
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
    },
  });

  if (!product) {
    notFound();
  }

  const primaryImage = product.images?.[0]?.url || "/placeholder.svg";

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Images Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/5] w-full rounded-2xl bg-secondary overflow-hidden relative shadow-sm">
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="w-24 h-24 rounded-lg bg-secondary overflow-hidden relative flex-shrink-0 cursor-pointer border hover:border-primary transition-colors"
                  >
                    <Image
                      src={img.url}
                      alt="Variant view"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Selection */}
          <div className="flex flex-col pt-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
              {product.category?.name || "Catálogo"}
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-foreground leading-tight">
              {product.title}
            </h1>

            <div className="mt-6 prose prose-sm sm:prose-base text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <ProductVariantSelector
              product={{
                id: product.id,
                title: product.title,
                category: product.category?.name,
                images: product.images,
              }}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
