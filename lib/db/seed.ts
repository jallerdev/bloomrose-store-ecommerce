import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const seed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🌱 Seeding Database...");

  console.log("Clearing Old Data...");
  await db.delete(schema.orderItems).catch(() => {});
  await db.delete(schema.orders).catch(() => {});
  await db.delete(schema.reviews).catch(() => {});
  await db.delete(schema.productImages).catch(() => {});
  await db.delete(schema.productVariants).catch(() => {});
  await db.delete(schema.products).catch(() => {});
  await db.delete(schema.categories).catch(() => {});

  console.log("Inserting Categories...");
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

  const getCategoryId = (slug: string) =>
    categoriesDb.find((c) => c.slug === slug)!.id;

  const rawProducts = [
    {
      title: "Luna Pearl Drop Earrings",
      slug: "luna-pearl-drop-earrings",
      description: "Hermosos aretes con perlas colgantes.",
      price: "58.00",
      imageUrl: "/products/earrings.jpg",
      categorySlug: "aretes",
      variantName: "Oro 18k",
      stock: 25,
    },
    {
      title: "Crystal Cascade Earrings",
      slug: "crystal-cascade-earrings",
      description: "Aretes largos con cristales austriacos en cascada.",
      price: "64.00",
      imageUrl: "/products/earrings-2.jpg",
      categorySlug: "aretes",
      variantName: "Plata 925",
      stock: 15,
    },
    {
      title: "Emerald Cut Studs",
      slug: "emerald-cut-studs",
      description: "Elegantes aretes tipo broquel con corte esmeralda.",
      price: "45.00",
      imageUrl: "/products/earrings-3.jpg",
      categorySlug: "aretes",
      variantName: "Oro 18k",
      stock: 30,
    },
    {
      title: "Diamond Hoop Earrings",
      slug: "diamond-hoop-earrings",
      description:
        "Arracadas clasicas adornadas con pequenos diamantes sinteticos.",
      price: "85.00",
      imageUrl: "/products/earrings-4.jpg",
      categorySlug: "aretes",
      variantName: "Plata 925",
      stock: 10,
    },
    {
      title: "Vintage Floral Studs",
      slug: "vintage-floral-studs",
      description: "Aretes de estilo vintage con diseno de flores detallado.",
      price: "38.00",
      imageUrl: "/products/earrings-5.jpg",
      categorySlug: "aretes",
      variantName: "Oro 18k",
      stock: 20,
    },
    {
      title: "Bohemian Woven Bracelet",
      slug: "bohemian-woven-bracelet",
      description: "Pulsera tejida a mano con hilos y cuentas.",
      price: "42.00",
      imageUrl: "/products/bracelet.jpg",
      categorySlug: "pulseras",
      variantName: "Cuero",
      stock: 40,
    },
    {
      title: "Serpentine Gold Chain Necklace",
      slug: "serpentine-gold-chain-necklace",
      description:
        "Elegante y atemporal cadena de oro entrelazada estilo serpiente que brinda un brillo fluido.",
      price: "68.00",
      imageUrl: "/images/product-necklace.jpg",
      categorySlug: "collares",
      variantName: "Oro 18k",
      stock: 15,
    },
    {
      title: "Delicate Rose Pendant",
      slug: "delicate-rose-pendant",
      description: "Collar con un delicado colgante en forma de rosa.",
      price: "55.00",
      imageUrl: "/products/necklace.jpg",
      categorySlug: "collares",
      variantName: "Acero Inoxidable",
      stock: 25,
    },
    {
      title: "Celestial Gold Ring",
      slug: "celestial-gold-ring",
      description: "Anillo con diseno inspirado en las estrellas y la luna.",
      price: "76.00",
      imageUrl: "/products/ring.jpg",
      categorySlug: "anillos",
      variantName: "Oro 18k",
      stock: 8,
    },
    {
      title: "Artisan Leather Tote",
      slug: "artisan-leather-tote",
      description: "Bolso de mano de cuero artesanal, ideal para el dia a dia.",
      price: "145.00",
      imageUrl: "/images/product-bag.jpg",
      categorySlug: "pulseras",
      variantName: "Cuero",
      stock: 12,
    },
    {
      title: "Riviera Cat-Eye Sunglasses",
      slug: "riviera-cat-eye-sunglasses",
      description: "Gafas de sol con estilo ojo de gato.",
      price: "112.00",
      imageUrl: "/images/product-sunglasses.jpg",
      categorySlug: "aretes",
      variantName: "Pasta",
      stock: 18,
    },
    {
      title: "Cashmere Blend Silk Scarf",
      slug: "cashmere-blend-silk-scarf",
      description: "Bufanda mezcla de cachemira y seda.",
      price: "89.00",
      imageUrl: "/images/product-scarf.jpg",
      categorySlug: "collares",
      variantName: "Seda",
      stock: 22,
    },
    {
      title: "Ivory Silk Scrunchie Set",
      slug: "ivory-silk-scrunchie-set",
      description: "Set de ligas para el cabello de seda color marfil.",
      price: "24.00",
      imageUrl: "/products/scrunchie.jpg",
      categorySlug: "anillos",
      variantName: "Seda",
      stock: 50,
    },
    {
      title: "Vintage Floral Hair Clips",
      slug: "vintage-floral-hair-clips",
      description: "Clips para el cabello florales estilo vintage.",
      price: "32.00",
      imageUrl: "/products/hairclips.jpg",
      categorySlug: "aretes",
      variantName: "Plata 925",
      stock: 35,
    },
  ];

  console.log("Inserting Products...");

  for (const item of rawProducts) {
    const [insertedProduct] = await db
      .insert(schema.products)
      .values({
        categoryId: getCategoryId(item.categorySlug),
        title: item.title,
        slug: item.slug,
        description: item.description,
        isActive: true,
      })
      .returning();

    await db.insert(schema.productImages).values({
      productId: insertedProduct.id,
      url: item.imageUrl,
      altText: item.title,
      displayOrder: 0,
    });

    await db.insert(schema.productVariants).values({
      productId: insertedProduct.id,
      sku: `${item.slug}-001`,
      name: item.variantName,
      price: item.price,
      stock: item.stock,
      isActive: true,
    });
  }

  console.log("✅ Products, Images and Variants inserted.");
  console.log("✨ Seeding completed successfully!");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
