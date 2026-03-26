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

  // 1. Insert Categories
  console.log("Inserting Categories...");
  const catEarrings = await db
    .insert(schema.categories)
    .values({
      name: "Aretes",
      slug: "aretes",
      description: "Aretes de diferentes estilos y materiales.",
    })
    .returning();

  const catNecklaces = await db
    .insert(schema.categories)
    .values({
      name: "Collares",
      slug: "collares",
      description: "Collares finos y artesanales.",
    })
    .returning();

  const catBracelets = await db
    .insert(schema.categories)
    .values({
      name: "Pulseras",
      slug: "pulseras",
      description: "Pulseras tejidas y de metal.",
    })
    .returning();

  const catRings = await db
    .insert(schema.categories)
    .values({
      name: "Anillos",
      slug: "anillos",
      description: "Anillos minimalistas y statement.",
    })
    .returning();

  console.log("✅ Categories inserted.");

  // 2. Insert Products
  console.log("Inserting Products...");
  await db.insert(schema.products).values([
    // Aretes
    {
      title: "Luna Pearl Drop Earrings",
      slug: "luna-pearl-drop-earrings",
      description: "Hermosos aretes con perlas colgantes.",
      price: "58.00",
      imageUrl: "/products/earrings.jpg",
      categoryId: catEarrings[0].id,
      material: "Oro 18k",
      stock: "25",
      isActive: true,
    },
    {
      title: "Crystal Cascade Earrings",
      slug: "crystal-cascade-earrings",
      description: "Aretes largos con cristales austriacos en cascada.",
      price: "64.00",
      imageUrl: "/products/earrings-2.jpg",
      categoryId: catEarrings[0].id,
      material: "Plata 925",
      stock: "15",
      isActive: true,
    },
    {
      title: "Emerald Cut Studs",
      slug: "emerald-cut-studs",
      description: "Elegantes aretes tipo broquel con corte esmeralda.",
      price: "45.00",
      imageUrl: "/products/earrings-3.jpg",
      categoryId: catEarrings[0].id,
      material: "Oro 18k",
      stock: "30",
      isActive: true,
    },
    {
      title: "Diamond Hoop Earrings",
      slug: "diamond-hoop-earrings",
      description:
        "Arracadas clasicas adornadas con pequenos diamantes sinteticos.",
      price: "85.00",
      imageUrl: "/products/earrings-4.jpg",
      categoryId: catEarrings[0].id,
      material: "Plata 925",
      stock: "10",
      isActive: true,
    },
    {
      title: "Vintage Floral Studs",
      slug: "vintage-floral-studs",
      description: "Aretes de estilo vintage con diseno de flores detallado.",
      price: "38.00",
      imageUrl: "/products/earrings-5.jpg",
      categoryId: catEarrings[0].id,
      material: "Oro 18k",
      stock: "20",
      isActive: true,
    },

    // Pulseras
    {
      title: "Bohemian Woven Bracelet",
      slug: "bohemian-woven-bracelet",
      description: "Pulsera tejida a mano con hilos y cuentas.",
      price: "42.00",
      imageUrl: "/products/bracelet.jpg",
      categoryId: catBracelets[0].id,
      material: "Cuero",
      stock: "40",
      isActive: true,
    },

    // Collares
    {
      title: "Serpentine Gold Chain Necklace",
      slug: "serpentine-gold-chain-necklace",
      description:
        "Elegante y atemporal cadena de oro entrelazada estilo serpiente que brinda un brillo fluido.",
      price: "68.00",
      imageUrl: "/images/product-necklace.jpg",
      categoryId: catNecklaces[0].id,
      material: "Oro 18k",
      stock: "15",
      isActive: true,
    },
    {
      title: "Delicate Rose Pendant",
      slug: "delicate-rose-pendant",
      description: "Collar con un delicado colgante en forma de rosa.",
      price: "55.00",
      imageUrl: "/products/necklace.jpg",
      categoryId: catNecklaces[0].id,
      material: "Acero Inoxidable",
      stock: "25",
      isActive: true,
    },

    // Anillos
    {
      title: "Celestial Gold Ring",
      slug: "celestial-gold-ring",
      description: "Anillo con diseno inspirado en las estrellas y la luna.",
      price: "76.00",
      imageUrl: "/products/ring.jpg",
      categoryId: catRings[0].id,
      material: "Oro 18k",
      stock: "8",
      isActive: true,
    },

    // Bolsos asignados como pulseras por ahora para no anadir otra categ
    {
      title: "Artisan Leather Tote",
      slug: "artisan-leather-tote",
      description: "Bolso de mano de cuero artesanal, ideal para el dia a dia.",
      price: "145.00",
      imageUrl: "/images/product-bag.jpg",
      categoryId: catBracelets[0].id,
      material: "Cuero",
      stock: "12",
      isActive: true,
    },

    // Accesorios
    {
      title: "Riviera Cat-Eye Sunglasses",
      slug: "riviera-cat-eye-sunglasses",
      description: "Gafas de sol con estilo ojo de gato.",
      price: "112.00",
      imageUrl: "/images/product-sunglasses.jpg",
      categoryId: catEarrings[0].id,
      material: "Pasta",
      stock: "18",
      isActive: true,
    },
    {
      title: "Cashmere Blend Silk Scarf",
      slug: "cashmere-blend-silk-scarf",
      description: "Bufanda mezcla de cachemira y seda.",
      price: "89.00",
      imageUrl: "/images/product-scarf.jpg",
      categoryId: catNecklaces[0].id,
      material: "Seda",
      stock: "22",
      isActive: true,
    },
    {
      title: "Ivory Silk Scrunchie Set",
      slug: "ivory-silk-scrunchie-set",
      description: "Set de ligas para el cabello de seda color marfil.",
      price: "24.00",
      imageUrl: "/products/scrunchie.jpg",
      categoryId: catRings[0].id,
      material: "Seda",
      stock: "50",
      isActive: true,
    },
    {
      title: "Vintage Floral Hair Clips",
      slug: "vintage-floral-hair-clips",
      description: "Clips para el cabello florales estilo vintage.",
      price: "32.00",
      imageUrl: "/products/hairclips.jpg",
      categoryId: catEarrings[0].id,
      material: "Plata 925",
      stock: "35",
      isActive: true,
    },
  ]);

  console.log("✅ Products inserted.");
  console.log("✨ Seeding completed successfully!");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
