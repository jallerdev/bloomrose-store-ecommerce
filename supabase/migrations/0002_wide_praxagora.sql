ALTER TABLE "orders" ALTER COLUMN "address_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_total" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_line_1" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_line_2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_city" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_department" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_postal_code" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_country" varchar(100) DEFAULT 'Colombia' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_carrier" varchar(50) DEFAULT 'Coordinadora' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_reference" varchar(255);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "compare_at_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "weight_grams" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "length_cm" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "width_cm" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "height_cm" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_reference_unique" UNIQUE("payment_reference");