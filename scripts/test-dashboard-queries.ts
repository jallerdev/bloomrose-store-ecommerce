import postgres from "postgres";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lt,
  lte,
  ne,
  sql,
  sum,
} from "drizzle-orm";

dotenv.config({ path: ".env.local" });
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });
const { orders, productVariants, products } = schema;

(async () => {
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 29);
  start30.setHours(0, 0, 0, 0);
  const start60 = new Date(now);
  start60.setDate(start60.getDate() - 59);
  start60.setHours(0, 0, 0, 0);

  const realSale = and(
    ne(orders.status, "CANCELLED"),
    ne(orders.status, "PENDING"),
  );

  console.log("test 1: revenue 30d");
  const r1 = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(and(realSale, gte(orders.createdAt, start30)));
  console.log("  ->", r1);

  console.log("test 2: revenue prev (30-60d)");
  const r2 = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(
      and(
        realSale,
        gte(orders.createdAt, start60),
        lt(orders.createdAt, start30),
      ),
    );
  console.log("  ->", r2);

  console.log("test 3: daily series");
  const r3 = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sum(orders.totalAmount),
      orders: count(orders.id),
    })
    .from(orders)
    .where(and(realSale, gte(orders.createdAt, start30)))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);
  console.log("  ->", r3);

  console.log("test 4: low stock");
  const r4 = await db
    .select({
      sku: productVariants.sku,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        lte(productVariants.stock, 5),
        eq(productVariants.isActive, true),
      ),
    )
    .orderBy(asc(productVariants.stock))
    .limit(5);
  console.log("  ->", r4);

  await client.end();
  console.log("✓ all queries OK");
})().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
