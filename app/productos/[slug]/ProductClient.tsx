"use client";

import { ProductImageGallery } from "@/components/ProductImageGallery";
import { ProductInfo } from "@/components/ProductInfo";

interface ProductClientProps {
  product: {
    id: string;
    sku: string;
    title: string;
    slug: string;
    price: number;
    description: string;
    imageUrl: string | null;
    category: string;
    stock: number;
  };
}

export function ProductClient({ product }: ProductClientProps) {
  // Mock color variants since we didn't add variants to DB schema yet
  const colors = [
    { name: "Dorado", value: "#FFD700", inStock: true },
    { name: "Plata", value: "#C0C0C0", inStock: product.stock > 0 },
    { name: "Oro Rosa", value: "#B76E79", inStock: false },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductImageGallery
          images={[
            {
              src: product.imageUrl || "/placeholder.svg",
              alt: product.title,
            },
          ]}
        />
        <ProductInfo
          id={product.id}
          imageUrl={product.imageUrl || ""}
          name={product.title}
          category={product.category}
          price={product.price}
          rating={4.8}
          reviewCount={12}
          description={product.description}
          colors={colors}
          stockCount={product.stock}
          sku={product.sku}
        />
      </div>
    </div>
  );
}
