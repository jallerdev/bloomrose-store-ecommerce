"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  addresses,
  orderItems,
  orders,
  productVariants,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { quote as quoteShipping } from "@/lib/coordinadora";
import { z } from "zod";

// Defaults de paquete cuando una variante no tiene dimensiones registradas
const DEFAULT_PACKAGE_GRAMS = 50;
const DEFAULT_PACKAGE_DIM_CM = { length: 10, width: 10, height: 5 };

const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

const newAddressSchema = z.object({
  fullName: z.string().min(2).max(255),
  phone: z.string().min(7).max(50),
  addressLine1: z.string().min(3).max(500),
  addressLine2: z.string().max(500).optional().nullable(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100), // departamento
  postalCode: z.string().max(20).optional().nullable(),
  saveForLater: z.boolean().optional(),
});

const inputSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  addressMode: z.enum(["existing", "new"]),
  existingAddressId: z.string().uuid().optional(),
  newAddress: newAddressSchema.optional(),
  contactFullName: z.string().min(2).max(255),
  contactPhone: z.string().min(7).max(50),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreatePendingOrderInput = z.infer<typeof inputSchema>;

export type CreatePendingOrderResult =
  | {
      ok: true;
      orderId: string;
      paymentReference: string;
      totalAmount: number;
      subtotal: number;
      shippingCost: number;
    }
  | { ok: false; error: string };

export async function createPendingOrderAction(
  raw: CreatePendingOrderInput,
): Promise<CreatePendingOrderResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Datos del pedido inválidos." };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  // 1. Resolver dirección de envío (snapshot)
  let shipping: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string | null;
    addressId: string | null;
  };

  if (input.addressMode === "existing") {
    if (!input.existingAddressId) {
      return { ok: false, error: "Selecciona una dirección." };
    }
    const [addr] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, input.existingAddressId))
      .limit(1);
    if (!addr || addr.profileId !== user.id) {
      return { ok: false, error: "Dirección no válida." };
    }
    shipping = {
      fullName: input.contactFullName,
      phone: input.contactPhone,
      line1: addr.addressLine1,
      line2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      addressId: addr.id,
    };
  } else {
    if (!input.newAddress) {
      return { ok: false, error: "Faltan datos de la dirección." };
    }
    const a = input.newAddress;
    let savedId: string | null = null;
    if (a.saveForLater) {
      const [inserted] = await db
        .insert(addresses)
        .values({
          profileId: user.id,
          addressLine1: a.addressLine1,
          addressLine2: a.addressLine2 ?? null,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode ?? null,
          country: "Colombia",
          isDefault: false,
        })
        .returning({ id: addresses.id });
      savedId = inserted.id;
    }
    shipping = {
      fullName: a.fullName,
      phone: a.phone,
      line1: a.addressLine1,
      line2: a.addressLine2 ?? null,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode ?? null,
      addressId: savedId,
    };
  }

  // 2. Re-validar precios y stock contra la DB (NUNCA confiar en el cliente)
  const variantIds = input.items.map((i) => i.variantId);
  const dbVariants = await db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));
  const lineItems: {
    variantId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const v = variantMap.get(item.variantId);
    if (!v || !v.isActive) {
      return {
        ok: false,
        error: `Un producto del carrito ya no está disponible.`,
      };
    }
    if (v.stock < item.quantity) {
      return {
        ok: false,
        error: `Stock insuficiente para "${v.name ?? v.sku}". Disponible: ${v.stock}.`,
      };
    }
    const unitPrice = Number(v.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    lineItems.push({
      variantId: v.id,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  // 3. Calcular envío (Coordinadora si está configurada; tarifa plana fallback)
  const totalWeight =
    input.items.reduce((acc, item) => {
      const v = variantMap.get(item.variantId)!;
      return acc + (v.weightGrams ?? DEFAULT_PACKAGE_GRAMS) * item.quantity;
    }, 0) || DEFAULT_PACKAGE_GRAMS;

  // Para dimensiones del paquete agregado usamos la variante más grande.
  // (Aproximación razonable; cajas reales se calculan al empacar.)
  const dims = input.items.reduce(
    (acc, item) => {
      const v = variantMap.get(item.variantId)!;
      return {
        length: Math.max(acc.length, v.lengthCm ?? DEFAULT_PACKAGE_DIM_CM.length),
        width: Math.max(acc.width, v.widthCm ?? DEFAULT_PACKAGE_DIM_CM.width),
        height: Math.max(acc.height, v.heightCm ?? DEFAULT_PACKAGE_DIM_CM.height),
      };
    },
    { ...DEFAULT_PACKAGE_DIM_CM },
  );

  const shippingQuote = await quoteShipping({
    originCity: process.env.COORDINADORA_ORIGIN_CITY ?? "Bogota",
    originDepartment:
      process.env.COORDINADORA_ORIGIN_DEPARTMENT ?? "Cundinamarca",
    destinationCity: shipping.city,
    destinationDepartment: shipping.state,
    package: {
      weightGrams: totalWeight,
      lengthCm: dims.length,
      widthCm: dims.width,
      heightCm: dims.height,
      declaredValue: subtotal,
    },
    subtotal,
  });
  const shippingCost = shippingQuote.cost;

  const discountTotal = 0; // Cupones: Fase 2
  const totalAmount = subtotal - discountTotal + shippingCost;

  // 4. Generar referencia única para Wompi
  const paymentReference = `BLR-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  // 5. Insertar pedido + items en transacción + decrementar stock
  try {
    const orderId = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          profileId: user.id,
          addressId: shipping.addressId,
          status: "PENDING",
          subtotal: subtotal.toFixed(2),
          discountTotal: discountTotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          shippingFullName: shipping.fullName,
          shippingPhone: shipping.phone,
          shippingAddressLine1: shipping.line1,
          shippingAddressLine2: shipping.line2,
          shippingCity: shipping.city,
          shippingDepartment: shipping.state,
          shippingPostalCode: shipping.postalCode,
          shippingCountry: "Colombia",
          shippingCarrier: "Coordinadora",
          paymentReference,
          notes: input.notes ?? null,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lineItems.map((li) => ({
          orderId: order.id,
          productVariantId: li.variantId,
          quantity: li.quantity,
          priceAtPurchase: li.unitPrice.toFixed(2),
        })),
      );

      // Reservar stock (decrementar). Si el pago falla, el webhook restaura.
      for (const li of lineItems) {
        const v = variantMap.get(li.variantId)!;
        await tx
          .update(productVariants)
          .set({ stock: v.stock - li.quantity })
          .where(eq(productVariants.id, li.variantId));
      }

      return order.id;
    });

    return {
      ok: true,
      orderId,
      paymentReference,
      totalAmount,
      subtotal,
      shippingCost,
    };
  } catch (err) {
    console.error("[createPendingOrderAction] tx failed", err);
    return { ok: false, error: "No se pudo crear el pedido. Intenta de nuevo." };
  }
}
