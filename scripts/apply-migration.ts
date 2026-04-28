import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const file = process.argv[2];
if (!file) throw new Error("Usage: tsx scripts/apply-migration.ts <path>");

const sql = readFileSync(resolve(file), "utf-8");
const statements = sql
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const client = postgres(url, { prepare: false });

(async () => {
  console.log(`Applying ${statements.length} statements from ${file}`);
  for (const [i, stmt] of statements.entries()) {
    try {
      await client.unsafe(stmt);
      console.log(`  ✓ ${i + 1}/${statements.length}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Tolerate "already exists" (column/constraint) so the script is idempotent
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column")
      ) {
        console.log(`  ⏭  ${i + 1}/${statements.length} (skip: ${msg.split("\n")[0]})`);
      } else {
        console.error(`  ✗ ${i + 1}/${statements.length}`);
        console.error(`    SQL: ${stmt.slice(0, 120)}...`);
        console.error(`    Error: ${msg}`);
        process.exit(1);
      }
    }
  }
  await client.end();
  console.log("Done.");
})();
