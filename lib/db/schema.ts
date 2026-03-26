import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: text("sku").generatedAlwaysAs(sql`'SKU-' || cast(id as text)`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: numeric("price").notNull(),
  imageUrl: text("image_url"),
  categoryId: uuid("category_id").references(() => categories.id),
  material: text("material"),
  stock: numeric("stock").notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0Id: text("auth0_id").unique(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: roleEnum("role").default("user").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
