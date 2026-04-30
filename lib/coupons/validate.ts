import { and, count, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  couponRedemptions,
  coupons,
  productVariants,
  products,
} from "@/lib/db/schema";

interface CartItemForCoupon {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface ValidatedCoupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  /** Monto a descontar del subtotal (siempre 0 para FREE_SHIPPING). */
  discountAmount: number;
  /** Si el cupón hace shipping gratis. */
  freeShipping: boolean;
}

export type CouponValidationResult =
  | { ok: true; coupon: ValidatedCoupon }
  | { ok: false; error: string };

/**
 * Valida un cupón contra el carrito actual y devuelve el descuento aplicable.
 * Reglas:
 *  - El código debe existir, estar activo y dentro de su ventana de fechas.
 *  - Si tiene minPurchase, el subtotal debe alcanzarlo.
 *  - maxUses: total de redenciones < maxUses.
 *  - maxUsesPerUser: redenciones de ESE usuario < maxUsesPerUser.
 *  - appliesTo CATEGORY/PRODUCT: el carrito debe incluir al menos un item
 *    perteneciente a la categoría/producto target. El descuento PERCENTAGE/FIXED
 *    se calcula sobre el subtotal de items elegibles para evitar abusos
 *    (ej. un cupón "20% en aretes" no descuenta los collares del carrito).
 */
export async function validateCoupon(
  rawCode: string,
  cart: { items: CartItemForCoupon[]; subtotal: number },
  userId: string | null,
): Promise<CouponValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Ingresa un código." };

  const now = new Date();
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
    .limit(1);

  if (!coupon) return { ok: false, error: "El código no existe o expiró." };

  // Ventana de fechas
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, error: "Este código aún no está activo." };
  }
  if (coupon.expiresAt && coupon.expiresAt <= now) {
    return { ok: false, error: "El código ya expiró." };
  }

  // Compra mínima
  if (coupon.minPurchase) {
    const min = Number(coupon.minPurchase);
    if (cart.subtotal < min) {
      const fmt = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(min);
      return {
        ok: false,
        error: `Este cupón requiere una compra mínima de ${fmt}.`,
      };
    }
  }

  // Tope global de usos
  if (coupon.maxUses) {
    const [usage] = await db
      .select({ n: count() })
      .from(couponRedemptions)
      .where(eq(couponRedemptions.couponId, coupon.id));
    if (Number(usage?.n ?? 0) >= coupon.maxUses) {
      return { ok: false, error: "Este cupón ya alcanzó su tope de usos." };
    }
  }

  // Tope por usuario (solo si está logueado; guests no tienen historial)
  if (coupon.maxUsesPerUser && userId) {
    const [perUser] = await db
      .select({ n: count() })
      .from(couponRedemptions)
      .where(
        and(
          eq(couponRedemptions.couponId, coupon.id),
          eq(couponRedemptions.profileId, userId),
        ),
      );
    if (Number(perUser?.n ?? 0) >= coupon.maxUsesPerUser) {
      return {
        ok: false,
        error: "Ya usaste este cupón el máximo de veces permitidas.",
      };
    }
  }

  // Calcular subtotal elegible
  let eligibleSubtotal = cart.subtotal;
  if (coupon.appliesTo !== "ALL" && coupon.targetIds && coupon.targetIds.length > 0) {
    eligibleSubtotal = await computeEligibleSubtotal(
      cart.items,
      coupon.appliesTo,
      coupon.targetIds,
    );
    if (eligibleSubtotal <= 0) {
      const target = coupon.appliesTo === "CATEGORY" ? "esa categoría" : "esos productos";
      return {
        ok: false,
        error: `Este cupón solo aplica a ${target}. Agrega al carrito un producto válido.`,
      };
    }
  }

  let discountAmount = 0;
  let freeShipping = false;
  if (coupon.type === "FREE_SHIPPING") {
    freeShipping = true;
  } else if (coupon.type === "PERCENTAGE") {
    discountAmount = Math.round((eligibleSubtotal * Number(coupon.value)) / 100);
  } else if (coupon.type === "FIXED") {
    discountAmount = Math.min(Number(coupon.value), eligibleSubtotal);
  }
  // No exceder el subtotal total
  discountAmount = Math.min(discountAmount, cart.subtotal);

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as ValidatedCoupon["type"],
      discountAmount,
      freeShipping,
    },
  };
}

async function computeEligibleSubtotal(
  items: CartItemForCoupon[],
  appliesTo: "CATEGORY" | "PRODUCT",
  targetIds: string[],
): Promise<number> {
  if (items.length === 0) return 0;

  const variantIds = items.map((i) => i.variantId);
  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: productVariants.productId,
      categoryId: products.categoryId,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      // Filtramos por las variantes del carrito; el match contra targetIds
      // se hace en JS para evitar inArray con strings (seguro y legible).
      or(...variantIds.map((id) => eq(productVariants.id, id))) ??
        // Sentinel imposible si el carrito está vacío; ya filtrado arriba.
        eq(productVariants.id, "00000000-0000-0000-0000-000000000000"),
    );

  const lookup = new Map<string, { productId: string; categoryId: string }>(
    rows.map((r) => [r.variantId, { productId: r.productId, categoryId: r.categoryId }]),
  );

  let eligible = 0;
  for (const item of items) {
    const meta = lookup.get(item.variantId);
    if (!meta) continue;
    const matches =
      appliesTo === "CATEGORY"
        ? targetIds.includes(meta.categoryId)
        : targetIds.includes(meta.productId);
    if (matches) eligible += item.unitPrice * item.quantity;
  }
  return eligible;
}

/**
 * Helper para identificar el query: ¿algún cupón vigente para esta condición?
 * No expone toda la tabla — solo lo necesario para la UI del checkout.
 */
export async function listActivePublicCoupons(): Promise<{ code: string }[]> {
  const now = new Date();
  return db
    .select({ code: coupons.code })
    .from(coupons)
    .where(
      and(
        eq(coupons.isActive, true),
        or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now))!,
      ),
    );
}
