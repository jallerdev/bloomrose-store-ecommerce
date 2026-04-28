"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { wishlistItems } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const productIdSchema = z.string().uuid();
const productIdsSchema = z.array(z.string().uuid()).max(500);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Devuelve la lista de productIds que el usuario actual tiene en favoritos.
 * Si no hay sesión, devuelve [].
 */
export async function loadWishlistAction(): Promise<string[]> {
  const user = await requireUser();
  if (!user) return [];

  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.profileId, user.id));
  return rows.map((r) => r.productId);
}

/**
 * Agrega un producto a favoritos. Idempotente.
 */
export async function addToWishlistAction(rawProductId: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const parsed = productIdSchema.safeParse(rawProductId);
  if (!parsed.success) return { ok: false, error: "Producto inválido" } as const;

  await db
    .insert(wishlistItems)
    .values({ profileId: user.id, productId: parsed.data })
    .onConflictDoNothing();

  return { ok: true } as const;
}

/**
 * Elimina un producto de favoritos.
 */
export async function removeFromWishlistAction(rawProductId: string) {
  const user = await requireUser();
  if (!user) return { ok: false, error: "No autenticado" } as const;

  const parsed = productIdSchema.safeParse(rawProductId);
  if (!parsed.success) return { ok: false, error: "Producto inválido" } as const;

  await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.profileId, user.id),
        eq(wishlistItems.productId, parsed.data),
      ),
    );

  return { ok: true } as const;
}

/**
 * Merge aditivo: agrega los productIds locales al carrito de favoritos del usuario.
 * Llamado al iniciar sesión para no perder los favoritos guardados como anónimo.
 * Devuelve el set completo resultante (locales + remotos).
 */
export async function syncWishlistAction(rawProductIds: string[]): Promise<string[]> {
  const user = await requireUser();
  if (!user) return [];

  const parsed = productIdsSchema.safeParse(rawProductIds);
  if (!parsed.success) return loadWishlistAction();

  if (parsed.data.length > 0) {
    // Validar que los productIds existan no es necesario porque la FK lo hace.
    // Filtramos duplicados localmente antes de insertar.
    const unique = Array.from(new Set(parsed.data));
    await db
      .insert(wishlistItems)
      .values(unique.map((pid) => ({ profileId: user.id, productId: pid })))
      .onConflictDoNothing();
  }

  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.profileId, user.id));
  return rows.map((r) => r.productId);
}

/**
 * Server-side helper para páginas server-rendered que necesiten leer la wishlist
 * con detalles de los productos. Devuelve productIds; el caller hace el join.
 */
export async function getCurrentWishlistIds(): Promise<string[]> {
  return loadWishlistAction();
}
