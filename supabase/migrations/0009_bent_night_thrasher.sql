ALTER TABLE "orders" ADD COLUMN "payment_method_preference" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "legal_id_type" varchar(8);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "legal_id" varchar(32);