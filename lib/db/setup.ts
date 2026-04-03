import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { prepare: false });

async function setup() {
  console.log("Dropping old schema...");
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;

  await sql`GRANT ALL ON SCHEMA public TO postgres`;
  await sql`GRANT ALL ON SCHEMA public TO public`;

  console.log("Creating Extensions...");
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  console.log("Creating Enums...");
  await sql`CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER')`;
  await sql`CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')`;

  console.log("Creating Tables...");
  await sql`
    CREATE TABLE profiles (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      phone VARCHAR(50),
      role user_role NOT NULL DEFAULT 'CUSTOMER',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE addresses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      address_line_1 TEXT NOT NULL,
      address_line_2 TEXT,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(20),
      country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
      is_default BOOLEAN NOT NULL DEFAULT false
    )
  `;

  await sql`
    CREATE TABLE categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id UUID NOT NULL REFERENCES categories(id),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE product_variants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(100),
      price NUMERIC(10,2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true
    )
  `;

  await sql`
    CREATE TABLE product_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text VARCHAR(255),
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id),
      address_id UUID NOT NULL REFERENCES addresses(id),
      status order_status NOT NULL DEFAULT 'PENDING',
      total_amount NUMERIC(10,2) NOT NULL,
      payment_method VARCHAR(100),
      payment_id VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_variant_id UUID NOT NULL REFERENCES product_variants(id),
      quantity INTEGER NOT NULL,
      price_at_purchase NUMERIC(10,2) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(profile_id, product_id)
    )
  `;

  console.log("Setting up Supabase Auth Trigger...");
  try {
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, first_name, last_name, role)
        VALUES (
          new.id,
          new.email,
          new.raw_user_meta_data->>'first_name',
          new.raw_user_meta_data->>'last_name',
          'CUSTOMER'
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`;
    await sql`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `;
    console.log("Trigger configured successfully!");
  } catch (err: any) {
    console.log(
      "Note: Could not attach trigger automatically (requires Supabase superuser permissions on auth schema). Please run the trigger script in your Supabase SQL Editor manually.",
    );
  }

  console.log("✅ DDL Setup completed.");
  process.exit(0);
}

setup().catch((e) => {
  console.error("❌ Setup failed:", e);
  process.exit(1);
});
