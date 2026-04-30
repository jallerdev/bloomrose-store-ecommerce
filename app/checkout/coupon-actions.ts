"use server";

import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { productVariants } from "@/lib/db/schema";
import { validateCoupon, type ValidatedCoupon } from "@/lib/coupons/validate";

const inputSchema = z.object({
  code: z.string().min(1).max(50),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
});

export type CheckCouponResult =
  | { ok: true; coupon: ValidatedCoupon }
  | { ok: false; error: string };

/**
 * Valida un código de cupón contra el carrito actual del usuario sin
 * confiar en los precios del cliente — los re-leemos de la DB.
 */
export async function checkCouponAction(input: {
  code: string;
  items: { variantId: string; quantity: number }[];
}): Promise<CheckCouponResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Re-leer precios desde DB
  const variantIds = parsed.data.items.map((i) => i.variantId);
  const dbVariants = await db
    .select({
      id: productVariants.id,
      price: productVariants.price,
      isActive: productVariants.isActive,
    })
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));
  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  const lineItems = parsed.data.items
    .map((it) => {
      const v = variantMap.get(it.variantId);
      if (!v || !v.isActive) return null;
      return {
        variantId: v.id,
        quantity: it.quantity,
        unitPrice: Number(v.price),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  const subtotal = lineItems.reduce(
    (acc, li) => acc + li.unitPrice * li.quantity,
    0,
  );

  const result = await validateCoupon(
    parsed.data.code,
    { items: lineItems, subtotal },
    user?.id ?? null,
  );

  return result;
}
