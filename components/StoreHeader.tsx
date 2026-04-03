import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeaderClient } from "@/components/StoreHeaderClient";

export async function StoreHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    try {
      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
        columns: { role: true },
      });
      if (profile) {
        role = profile.role;
      }
    } catch (err) {
      console.error("StoreHeader Profile validation error", err);
    }
  }

  return <StoreHeaderClient serverUser={user} serverRole={role} />;
}
