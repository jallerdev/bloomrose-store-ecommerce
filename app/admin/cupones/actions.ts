"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { coupons, profiles } from "@/lib/db/schema";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  if (profile?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos" } as const;
  return { ok: true } as const;
}

const baseSchema = z.object({
  code: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Solo mayúsculas, números, guion y guion bajo"),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z
    .number()
    .min(0, "El valor no puede ser negativo")
    .max(10_000_000),
  minPurchase: z.number().min(0).max(10_000_000).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  maxUsesPerUser: z.number().int().min(1).optional().nullable(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean(),
  appliesTo: z.enum(["ALL", "CATEGORY", "PRODUCT"]),
  targetIds: z.array(z.string().uuid()).optional().nullable(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({ id: z.string().uuid() });

export async function createCouponAction(input: z.infer<typeof createSchema>) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    } as const;
  }

  try {
    await db.insert(coupons).values({
      code: parsed.data.code.toUpperCase(),
      description: parsed.data.description ?? null,
      type: parsed.data.type,
      value: parsed.data.value.toFixed(2),
      minPurchase:
        parsed.data.minPurchase != null
          ? parsed.data.minPurchase.toFixed(2)
          : null,
      maxUses: parsed.data.maxUses ?? null,
      maxUsesPerUser: parsed.data.maxUsesPerUser ?? null,
      startsAt: parsed.data.startsAt ?? new Date(),
      expiresAt: parsed.data.expiresAt ?? null,
      isActive: parsed.data.isActive,
      appliesTo: parsed.data.appliesTo,
      targetIds:
        parsed.data.appliesTo === "ALL" ? null : parsed.data.targetIds ?? null,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate")) {
      return { ok: false, error: "Ya existe un cupón con ese código." } as const;
    }
    console.error("[createCouponAction]", err);
    return { ok: false, error: "No se pudo crear el cupón." } as const;
  }

  revalidatePath("/admin/cupones");
  return { ok: true } as const;
}

export async function updateCouponAction(input: z.infer<typeof updateSchema>) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    } as const;
  }

  await db
    .update(coupons)
    .set({
      code: parsed.data.code.toUpperCase(),
      description: parsed.data.description ?? null,
      type: parsed.data.type,
      value: parsed.data.value.toFixed(2),
      minPurchase:
        parsed.data.minPurchase != null
          ? parsed.data.minPurchase.toFixed(2)
          : null,
      maxUses: parsed.data.maxUses ?? null,
      maxUsesPerUser: parsed.data.maxUsesPerUser ?? null,
      startsAt: parsed.data.startsAt ?? new Date(),
      expiresAt: parsed.data.expiresAt ?? null,
      isActive: parsed.data.isActive,
      appliesTo: parsed.data.appliesTo,
      targetIds:
        parsed.data.appliesTo === "ALL" ? null : parsed.data.targetIds ?? null,
    })
    .where(eq(coupons.id, parsed.data.id));

  revalidatePath("/admin/cupones");
  return { ok: true } as const;
}

export async function deleteCouponAction(couponId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const id = z.string().uuid().safeParse(couponId);
  if (!id.success) return { ok: false, error: "ID inválido" } as const;

  await db.delete(coupons).where(eq(coupons.id, id.data));
  revalidatePath("/admin/cupones");
  return { ok: true } as const;
}

export async function toggleCouponActiveAction(input: {
  couponId: string;
  isActive: boolean;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  await db
    .update(coupons)
    .set({ isActive: input.isActive })
    .where(eq(coupons.id, input.couponId));
  revalidatePath("/admin/cupones");
  return { ok: true } as const;
}
