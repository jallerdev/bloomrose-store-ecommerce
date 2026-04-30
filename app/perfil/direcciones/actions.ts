"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

const baseSchema = z.object({
  addressLine1: z.string().min(3).max(500),
  addressLine2: z.string().max(500).optional().nullable(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().uuid(),
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function addAddressAction(input: z.infer<typeof createSchema>) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" } as const;

  await db.transaction(async (tx) => {
    if (parsed.data.isDefault) {
      // Solo una dirección por usuario puede ser default a la vez.
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.profileId, user.id));
    }
    await tx.insert(addresses).values({
      profileId: user.id,
      addressLine1: parsed.data.addressLine1,
      addressLine2: parsed.data.addressLine2 ?? null,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode ?? null,
      country: "Colombia",
      isDefault: parsed.data.isDefault ?? false,
    });
  });

  revalidatePath("/perfil/direcciones");
  revalidatePath("/checkout");
  return { ok: true } as const;
}

export async function updateAddressAction(input: z.infer<typeof updateSchema>) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" } as const;

  // Verificar ownership antes de actualizar
  const [addr] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, parsed.data.id))
    .limit(1);
  if (!addr || addr.profileId !== user.id) {
    return { ok: false, error: "Dirección no encontrada" } as const;
  }

  await db.transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.profileId, user.id));
    }
    await tx
      .update(addresses)
      .set({
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 ?? null,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode ?? null,
        isDefault: parsed.data.isDefault ?? addr.isDefault,
      })
      .where(eq(addresses.id, parsed.data.id));
  });

  revalidatePath("/perfil/direcciones");
  revalidatePath("/checkout");
  return { ok: true } as const;
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const id = z.string().uuid().safeParse(addressId);
  if (!id.success) return { ok: false, error: "ID inválido" } as const;

  await db
    .delete(addresses)
    .where(
      and(eq(addresses.id, id.data), eq(addresses.profileId, user.id)),
    );

  revalidatePath("/perfil/direcciones");
  revalidatePath("/checkout");
  return { ok: true } as const;
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const id = z.string().uuid().safeParse(addressId);
  if (!id.success) return { ok: false, error: "ID inválido" } as const;

  await db.transaction(async (tx) => {
    await tx
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.profileId, user.id));
    await tx
      .update(addresses)
      .set({ isDefault: true })
      .where(
        and(eq(addresses.id, id.data), eq(addresses.profileId, user.id)),
      );
  });

  revalidatePath("/perfil/direcciones");
  revalidatePath("/checkout");
  return { ok: true } as const;
}
