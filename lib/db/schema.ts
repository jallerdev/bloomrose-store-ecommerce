import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  decimal,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "CUSTOMER"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

// ------------------------------------------------------
// 1. USUARIOS Y PERFILES (Integración con Supabase Auth)
// ------------------------------------------------------

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // DEBE coincidir con el id de auth.users de Supabase
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  role: userRoleEnum("role").default("CUSTOMER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("Colombia").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

// ------------------------------------------------------
// 2. CATÁLOGO DE PRODUCTOS (Escalable a Variantes)
// ------------------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }), // Ej: "Baño de Oro", "Acero Inoxidable"
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  // Precio "antes" para mostrar tachado cuando price < compareAtPrice
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  // Datos físicos requeridos por Coordinadora para cotizar envío
  weightGrams: integer("weight_grams"),
  lengthCm: integer("length_cm"),
  widthCm: integer("width_cm"),
  heightCm: integer("height_cm"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
});

// ------------------------------------------------------
// 3. TRANSACCIONES Y PEDIDOS (Inmutabilidad)
// ------------------------------------------------------

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .references(() => profiles.id)
    .notNull(),
  // Referencia "viva" a la dirección (puede ser null si el usuario la borra).
  // El snapshot de la dirección se guarda más abajo para inmutabilidad.
  addressId: uuid("address_id").references(() => addresses.id),
  status: orderStatusEnum("status").default("PENDING").notNull(),

  // Desglose de montos (todos en COP)
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Snapshot de dirección de envío (inmutable)
  shippingFullName: varchar("shipping_full_name", { length: 255 }),
  shippingPhone: varchar("shipping_phone", { length: 50 }),
  shippingAddressLine1: text("shipping_address_line_1"),
  shippingAddressLine2: text("shipping_address_line_2"),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingDepartment: varchar("shipping_department", { length: 100 }),
  shippingPostalCode: varchar("shipping_postal_code", { length: 20 }),
  shippingCountry: varchar("shipping_country", { length: 100 })
    .default("Colombia")
    .notNull(),

  // Envío
  shippingCarrier: varchar("shipping_carrier", { length: 50 })
    .default("Coordinadora")
    .notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),

  // Pago (Wompi)
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentId: varchar("payment_id", { length: 255 }),
  paymentReference: varchar("payment_reference", { length: 255 }).unique(),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: uuid("product_variant_id")
    .references(() => productVariants.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: decimal("price_at_purchase", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

// ------------------------------------------------------
// 4. ENGAGEMENT
// ------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    // Un usuario solo puede dejar un review por producto
    unq: uniqueIndex("profile_product_idx").on(t.profileId, t.productId),
  }),
);

// ------------------------------------------------------
// DEFINICIÓN DE RELACIONES (Para db.query.modelo.findMany)
// ------------------------------------------------------

export const profilesRelations = relations(profiles, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [orders.profileId],
    references: [profiles.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    orderItems: many(orderItems),
  }),
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
