import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL!;
console.log(
  "Intentando conectar a:",
  connectionString.replace(/:([^:@]+)@/, ":***@"),
);

const sql = postgres(connectionString, { ssl: "require", connect_timeout: 5 });

async function check() {
  try {
    const res = await sql`SELECT 1 as result`;
    console.log("¡Conexión exitosa a Supabase!", res);
    process.exit(0);
  } catch (error) {
    console.error("Fallo la conexión:", error);
    process.exit(1);
  }
}

check();
