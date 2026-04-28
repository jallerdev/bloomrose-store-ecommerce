"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  addresses,
  orderItems,
  orders,
  productVariants,
  profiles,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createGuide } from "@/lib/coordinadora";
import { sendOrderShippedEmail } from "@/lib/email";

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);
  if (profile?.role !== "ADMIN")
    return { ok: false, error: "Sin permisos de administrador" };
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Cambiar estado del pedido
// ─────────────────────────────────────────────────────────────────

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function updateOrderStatusAction(input: {
  orderId: string;
  status: string;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Estado inválido" };

  await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, parsed.data.orderId));

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${parsed.data.orderId}`);
  return { ok: true } as const;
}

// ─────────────────────────────────────────────────────────────────
// Generar guía Coordinadora (o registrar tracking manual)
// ─────────────────────────────────────────────────────────────────

const trackingSchema = z.object({
  orderId: z.string().uuid(),
  trackingNumber: z.string().min(3).max(100),
});

export async function setTrackingNumberAction(input: {
  orderId: string;
  trackingNumber: string;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Tracking inválido" };

  await db
    .update(orders)
    .set({
      trackingNumber: parsed.data.trackingNumber,
      status: "SHIPPED",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, parsed.data.orderId));

  // Email no bloqueante
  sendOrderShippedEmail({ orderId: parsed.data.orderId }).catch((e) =>
    console.error("Shipped email failed:", e),
  );

  revalidatePath(`/admin/pedidos/${parsed.data.orderId}`);
  return { ok: true } as const;
}

export async function generateCoordinadoraGuideAction(input: {
  orderId: string;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, input.orderId))
    .limit(1);
  if (!order) return { ok: false, error: "Pedido no encontrado" };
  if (!order.shippingAddressLine1)
    return { ok: false, error: "Dirección de envío incompleta" };

  // Calcular dimensiones agregadas del paquete a partir de los items
  const items = await db
    .select({
      quantity: orderItems.quantity,
      weightGrams: productVariants.weightGrams,
      lengthCm: productVariants.lengthCm,
      widthCm: productVariants.widthCm,
      heightCm: productVariants.heightCm,
    })
    .from(orderItems)
    .innerJoin(
      productVariants,
      eq(orderItems.productVariantId, productVariants.id),
    )
    .where(eq(orderItems.orderId, order.id));

  const totalWeight =
    items.reduce(
      (acc, it) => acc + (it.weightGrams ?? 50) * it.quantity,
      0,
    ) || 50;

  const dims = items.reduce(
    (acc, it) => ({
      length: Math.max(acc.length, it.lengthCm ?? 10),
      width: Math.max(acc.width, it.widthCm ?? 10),
      height: Math.max(acc.height, it.heightCm ?? 5),
    }),
    { length: 10, width: 10, height: 5 },
  );

  try {
    const result = await createGuide({
      orderId: order.id,
      paymentReference: order.paymentReference!,
      recipient: {
        fullName: order.shippingFullName!,
        phone: order.shippingPhone!,
        addressLine1: order.shippingAddressLine1!,
        addressLine2: order.shippingAddressLine2,
        city: order.shippingCity!,
        department: order.shippingDepartment!,
        postalCode: order.shippingPostalCode,
      },
      package: {
        weightGrams: totalWeight,
        lengthCm: dims.length,
        widthCm: dims.width,
        heightCm: dims.height,
        declaredValue: Number(order.subtotal),
      },
    });

    await db
      .update(orders)
      .set({
        trackingNumber: result.trackingNumber,
        status: "SHIPPED",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    sendOrderShippedEmail({ orderId: order.id }).catch((e) =>
      console.error("Shipped email failed:", e),
    );

    revalidatePath(`/admin/pedidos/${order.id}`);
    return { ok: true, trackingNumber: result.trackingNumber } as const;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al generar guía",
    };
  }
}
