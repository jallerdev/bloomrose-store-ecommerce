import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

(async () => {
  const cols = await client<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('orders', 'product_variants')
      AND column_name IN (
        'subtotal','discount_total','shipping_cost','shipping_city',
        'shipping_department','tracking_number','shipping_carrier',
        'payment_reference','compare_at_price','weight_grams',
        'length_cm','width_cm','height_cm'
      )
    ORDER BY table_name, column_name
  `;
  console.table(cols);
  await client.end();
})();
