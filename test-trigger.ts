import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function testInsert() {
  try {
    const testId = "00000000-0000-0000-0000-000000000001";
    // mimicking the trigger
    await sql`
      INSERT INTO public.profiles (id, email, first_name, last_name, role)
      VALUES (
        ${testId},
        'test@test.com',
        'Test',
        'User',
        'CUSTOMER'
      )
    `;
    console.log("Success inserting test profile!");

    // cleanup
    await sql`DELETE FROM public.profiles WHERE id = ${testId}`;
  } catch (err) {
    console.error("Failed to insert profile:", err);
  } finally {
    process.exit(0);
  }
}

testInsert();
