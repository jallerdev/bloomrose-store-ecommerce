import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─────────────────────────────────────────────────────────────────
// Tipado del seed
// ─────────────────────────────────────────────────────────────────

type SeedVariant = {
  /** Sufijo del SKU. SKU final: <product-slug>-<sufijo> */
  skuSuffix: string;
  /** Nombre visible (material/acabado): "Oro 18k", "Plata 925", "Oro Rosa", etc. */
  name: string;
  /** Precio actual en COP (sin decimales). */
  price: number;
  /** Precio "antes" en COP. Si es mayor que `price`, aparece tachado en la UI. */
  compareAtPrice?: number;
  stock: number;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

type SeedProduct = {
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  /** Lista de imágenes (rutas relativas a /public). La primera es la principal. */
  images: string[];
  variants: SeedVariant[];
};

// ─────────────────────────────────────────────────────────────────
// Defaults físicos por categoría (para Coordinadora)
// ─────────────────────────────────────────────────────────────────

const DIMS = {
  small: { weightGrams: 40, lengthCm: 8, widthCm: 8, heightCm: 4 }, // aretes, anillos
  medium: { weightGrams: 80, lengthCm: 15, widthCm: 10, heightCm: 5 }, // collares, pulseras
  large: { weightGrams: 250, lengthCm: 30, widthCm: 25, heightCm: 10 }, // bolsos
  scarf: { weightGrams: 120, lengthCm: 30, widthCm: 25, heightCm: 5 },
};

// Helper: variante simple con dims por preset
function v(
  preset: keyof typeof DIMS,
  partial: Pick<SeedVariant, "skuSuffix" | "name" | "price" | "stock"> &
    Partial<Pick<SeedVariant, "compareAtPrice">>,
): SeedVariant {
  return { ...DIMS[preset], ...partial };
}

// ─────────────────────────────────────────────────────────────────
// Catálogo
// ─────────────────────────────────────────────────────────────────

const seedProducts: SeedProduct[] = [
  // ───────── ARETES ─────────
  {
    title: "Aretes Luna Pearl Drop",
    slug: "luna-pearl-drop-earrings",
    description:
      "Aretes con perlas colgantes cultivadas. Largo 3cm, cierre de mariposa hipoalergénico. Ideales para ocasiones especiales o el día a día.",
    categorySlug: "aretes",
    images: ["/products/earrings.jpg"],
    variants: [
      v("small", {
        skuSuffix: "oro18k",
        name: "Oro 18k",
        price: 189000,
        compareAtPrice: 245000,
        stock: 12,
      }),
      v("small", {
        skuSuffix: "plata925",
        name: "Plata 925",
        price: 129000,
        stock: 18,
      }),
      v("small", {
        skuSuffix: "ororosa",
        name: "Oro Rosa",
        price: 199000,
        stock: 6,
      }),
    ],
  },
  {
    title: "Aretes Crystal Cascade",
    slug: "crystal-cascade-earrings",
    description:
      "Aretes largos con cristales austriacos en cascada. Brillo intenso y movimiento fluido. Largo 6cm.",
    categorySlug: "aretes",
    images: ["/products/earrings-2.jpg"],
    variants: [
      v("small", {
        skuSuffix: "plata",
        name: "Plata 925",
        price: 165000,
        stock: 9,
      }),
      v("small", {
        skuSuffix: "oro",
        name: "Oro 18k",
        price: 219000,
        compareAtPrice: 269000,
        stock: 5,
      }),
    ],
  },
  {
    title: "Broqueles Emerald Cut",
    slug: "emerald-cut-studs",
    description:
      "Elegantes broqueles con corte esmeralda. Cierre de tornillo de seguridad. Perfectos para uso diario.",
    categorySlug: "aretes",
    images: ["/products/earrings-3.jpg"],
    variants: [
      v("small", {
        skuSuffix: "oro",
        name: "Oro 18k",
        price: 145000,
        stock: 22,
      }),
      v("small", {
        skuSuffix: "plata",
        name: "Plata 925",
        price: 95000,
        compareAtPrice: 125000,
        stock: 30,
      }),
    ],
  },
  {
    title: "Arracadas Diamond Hoop",
    slug: "diamond-hoop-earrings",
    description:
      "Arracadas clásicas adornadas con pequeños diamantes sintéticos. Diámetro 2.5cm.",
    categorySlug: "aretes",
    images: ["/products/earrings-4.jpg"],
    variants: [
      v("small", {
        skuSuffix: "plata",
        name: "Plata 925",
        price: 235000,
        compareAtPrice: 295000,
        stock: 8,
      }),
      v("small", {
        skuSuffix: "oro",
        name: "Oro 18k",
        price: 339000,
        stock: 3,
      }),
    ],
  },
  {
    title: "Broqueles Vintage Floral",
    slug: "vintage-floral-studs",
    description:
      "Aretes de estilo vintage con detallado diseño floral. Acabado mate.",
    categorySlug: "aretes",
    images: ["/products/earrings-5.jpg"],
    variants: [
      v("small", {
        skuSuffix: "oro",
        name: "Oro 18k",
        price: 119000,
        stock: 14,
      }),
    ],
  },

  // ───────── COLLARES ─────────
  {
    title: "Collar Serpentine Gold Chain",
    slug: "serpentine-gold-chain-necklace",
    description:
      "Cadena de oro entrelazada estilo serpiente. Largo ajustable de 40 a 45cm. Cierre de langosta reforzado.",
    categorySlug: "collares",
    images: ["/images/product-necklace.jpg"],
    variants: [
      v("medium", {
        skuSuffix: "oro18k",
        name: "Oro 18k",
        price: 215000,
        compareAtPrice: 269000,
        stock: 9,
      }),
      v("medium", {
        skuSuffix: "ororosa",
        name: "Oro Rosa",
        price: 225000,
        stock: 4,
      }),
    ],
  },
  {
    title: "Collar Delicate Rose Pendant",
    slug: "delicate-rose-pendant",
    description:
      "Collar con un delicado colgante en forma de rosa. Cadena de 45cm con extensor de 5cm.",
    categorySlug: "collares",
    images: ["/products/necklace.jpg"],
    variants: [
      v("medium", {
        skuSuffix: "acero",
        name: "Acero Inoxidable",
        price: 89000,
        stock: 25,
      }),
      v("medium", {
        skuSuffix: "plata",
        name: "Plata 925",
        price: 159000,
        compareAtPrice: 199000,
        stock: 12,
      }),
    ],
  },
  {
    title: "Pañuelo de Seda Cashmere Blend",
    slug: "cashmere-blend-silk-scarf",
    description:
      "Pañuelo en mezcla de cachemira y seda. Suave al tacto y muy resistente. 70x70cm.",
    categorySlug: "collares",
    images: ["/images/product-scarf.jpg"],
    variants: [
      v("scarf", {
        skuSuffix: "marfil",
        name: "Marfil",
        price: 245000,
        stock: 11,
      }),
      v("scarf", {
        skuSuffix: "negro",
        name: "Negro",
        price: 245000,
        compareAtPrice: 295000,
        stock: 7,
      }),
    ],
  },

  // ───────── PULSERAS ─────────
  {
    title: "Pulsera Bohemian Woven",
    slug: "bohemian-woven-bracelet",
    description:
      "Pulsera tejida a mano con hilos encerados y cuentas de cristal. Cierre ajustable.",
    categorySlug: "pulseras",
    images: ["/products/bracelet.jpg"],
    variants: [
      v("medium", {
        skuSuffix: "tierra",
        name: "Tonos Tierra",
        price: 79000,
        stock: 28,
      }),
      v("medium", {
        skuSuffix: "azul",
        name: "Azul Profundo",
        price: 79000,
        stock: 15,
      }),
      v("medium", {
        skuSuffix: "rosa",
        name: "Rosa Coral",
        price: 79000,
        compareAtPrice: 99000,
        stock: 22,
      }),
    ],
  },
  {
    title: "Bolso Artisan Leather Tote",
    slug: "artisan-leather-tote",
    description:
      "Bolso de mano de cuero artesanal cosido a mano. Ideal para el día a día. 35x30cm.",
    categorySlug: "pulseras",
    images: ["/images/product-bag.jpg"],
    variants: [
      v("large", {
        skuSuffix: "miel",
        name: "Cuero Miel",
        price: 389000,
        compareAtPrice: 459000,
        stock: 6,
      }),
      v("large", {
        skuSuffix: "negro",
        name: "Cuero Negro",
        price: 389000,
        stock: 4,
      }),
    ],
  },

  // ───────── ANILLOS ─────────
  {
    title: "Anillo Celestial Gold",
    slug: "celestial-gold-ring",
    description:
      "Anillo con diseño inspirado en estrellas y luna. Disponible en tallas 5 a 9.",
    categorySlug: "anillos",
    images: ["/products/ring.jpg"],
    variants: [
      v("small", {
        skuSuffix: "talla6",
        name: "Talla 6 · Oro 18k",
        price: 175000,
        stock: 5,
      }),
      v("small", {
        skuSuffix: "talla7",
        name: "Talla 7 · Oro 18k",
        price: 175000,
        stock: 8,
      }),
      v("small", {
        skuSuffix: "talla8",
        name: "Talla 8 · Oro 18k",
        price: 175000,
        compareAtPrice: 215000,
        stock: 2,
      }),
    ],
  },
  {
    title: "Set Scrunchies Ivory Silk",
    slug: "ivory-silk-scrunchie-set",
    description:
      "Set de 3 ligas de seda color marfil. No maltratan el cabello. Lavables a mano.",
    categorySlug: "anillos",
    images: ["/products/scrunchie.jpg"],
    variants: [
      v("medium", {
        skuSuffix: "set3",
        name: "Set x3",
        price: 65000,
        stock: 45,
      }),
    ],
  },

  // ───────── EXTRAS ─────────
  {
    title: "Gafas Riviera Cat-Eye",
    slug: "riviera-cat-eye-sunglasses",
    description:
      "Gafas de sol con estilo ojo de gato. Protección UV400. Estuche de tela incluido.",
    categorySlug: "aretes",
    images: ["/images/product-sunglasses.jpg"],
    variants: [
      v("medium", {
        skuSuffix: "negro",
        name: "Pasta Negra",
        price: 145000,
        compareAtPrice: 189000,
        stock: 14,
      }),
      v("medium", {
        skuSuffix: "carey",
        name: "Carey",
        price: 159000,
        stock: 9,
      }),
    ],
  },
  {
    title: "Clips Florales Vintage",
    slug: "vintage-floral-hair-clips",
    description:
      "Set de 2 clips para el cabello con detalles florales estilo vintage.",
    categorySlug: "aretes",
    images: ["/products/hairclips.jpg"],
    variants: [
      v("small", {
        skuSuffix: "plata",
        name: "Plata 925",
        price: 95000,
        stock: 0, // agotado, para ver el estado en la UI
      }),
      v("small", {
        skuSuffix: "oro",
        name: "Oro 18k",
        price: 119000,
        stock: 32,
      }),
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────

const seed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🌱 Seeding Database...");

  console.log("Clearing old catalog data...");
  await db.delete(schema.orderItems).catch(() => {});
  await db.delete(schema.orders).catch(() => {});
  await db.delete(schema.reviews).catch(() => {});
  await db.delete(schema.productImages).catch(() => {});
  await db.delete(schema.productVariants).catch(() => {});
  await db.delete(schema.products).catch(() => {});
  await db.delete(schema.categories).catch(() => {});

  console.log("Inserting categories...");
  const categoriesDb = await db
    .insert(schema.categories)
    .values([
      {
        name: "Aretes",
        slug: "aretes",
        description: "Aretes de diferentes estilos y materiales.",
      },
      {
        name: "Collares",
        slug: "collares",
        description: "Collares finos y artesanales.",
      },
      {
        name: "Pulseras",
        slug: "pulseras",
        description: "Pulseras tejidas y de metal.",
      },
      {
        name: "Anillos",
        slug: "anillos",
        description: "Anillos minimalistas y statement.",
      },
    ])
    .returning();

  const categoryIdBySlug = new Map(categoriesDb.map((c) => [c.slug, c.id]));

  console.log(`Inserting ${seedProducts.length} products with variants...`);

  let productCount = 0;
  let variantCount = 0;
  let imageCount = 0;

  for (const item of seedProducts) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${item.categorySlug}`);
    }

    const [insertedProduct] = await db
      .insert(schema.products)
      .values({
        categoryId,
        title: item.title,
        slug: item.slug,
        description: item.description,
        isActive: true,
      })
      .returning();
    productCount++;

    await db.insert(schema.productImages).values(
      item.images.map((url, i) => ({
        productId: insertedProduct.id,
        url,
        altText: item.title,
        displayOrder: i,
      })),
    );
    imageCount += item.images.length;

    await db.insert(schema.productVariants).values(
      item.variants.map((variant) => ({
        productId: insertedProduct.id,
        sku: `${item.slug}-${variant.skuSuffix}`,
        name: variant.name,
        price: variant.price.toFixed(2),
        compareAtPrice: variant.compareAtPrice
          ? variant.compareAtPrice.toFixed(2)
          : null,
        stock: variant.stock,
        weightGrams: variant.weightGrams,
        lengthCm: variant.lengthCm,
        widthCm: variant.widthCm,
        heightCm: variant.heightCm,
        isActive: true,
      })),
    );
    variantCount += item.variants.length;
  }

  console.log(
    `✅ ${productCount} products · ${variantCount} variants · ${imageCount} images.`,
  );
  console.log("✨ Seeding completed successfully!");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
