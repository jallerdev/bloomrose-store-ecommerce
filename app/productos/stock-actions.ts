"use server";

import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { stockNotifications } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  productId: z.string().uuid(),
  email: z.string().email().max(255),
});

export type StockNotifyResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string };

export async function subscribeToStockAction(
  raw: unknown,
): Promise<StockNotifyResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Email inválido." };
  }
  const { productId, email } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya hay una suscripción pendiente con el mismo email para el mismo
  // producto, evitamos duplicar.
  const existing = await db
    .select()
    .from(stockNotifications)
    .where(
      and(
        eq(stockNotifications.productId, productId),
        eq(stockNotifications.email, email),
        isNull(stockNotifications.notifiedAt),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { ok: true, alreadySubscribed: true };
  }

  await db.insert(stockNotifications).values({
    productId,
    email,
    profileId: user?.id ?? null,
  });

  return { ok: true, alreadySubscribed: false };
}
