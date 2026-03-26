import { ProductCard } from "@/components/ProductCard";

interface RelatedProduct {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  badgeVariant?: "sale" | "new" | "bestseller";
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section aria-label="Productos relacionados">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-xl text-foreground sm:text-2xl">
            Tambien te puede gustar
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Piezas seleccionadas para complementar tu estilo
          </p>
        </div>
        <a
          href="#"
          className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline sm:text-sm"
        >
          Ver todos
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.name} {...product} />
        ))}
      </div>
    </section>
  );
}
