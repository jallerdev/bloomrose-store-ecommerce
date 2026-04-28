import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderItems, orders, productVariants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookChecksum, type WompiWebhookBody } from "@/lib/wompi";
import { sendOrderPaidEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: WompiWebhookBody;
  try {
    body = (await req.json()) as WompiWebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!verifyWebhookChecksum(body)) {
    console.warn("[wompi.webhook] checksum inválido");
    return NextResponse.json({ error: "invalid_checksum" }, { status: 401 });
  }

  if (body.event !== "transaction.updated") {
    // Ignoramos otros eventos por ahora pero respondemos 200 para que Wompi no reintente.
    return NextResponse.json({ ok: true, ignored: body.event });
  }

  const tx = body.data.transaction;
  const reference = tx.reference;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentReference, reference))
    .limit(1);

  if (!order) {
    console.warn(`[wompi.webhook] orden no encontrada para reference=${reference}`);
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  // Idempotencia: si ya está pagado, no re-procesar
  if (order.status === "PAID" && tx.status === "APPROVED") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  if (tx.status === "APPROVED") {
    await db
      .update(orders)
      .set({
        status: "PAID",
        paymentId: tx.id,
        paymentMethod: tx.payment_method_type,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // Email de confirmación (no bloqueamos webhook si falla)
    sendOrderPaidEmail({ orderId: order.id }).catch((e) =>
      console.error("[wompi.webhook] email failed", e),
    );

    return NextResponse.json({ ok: true });
  }

  if (
    tx.status === "DECLINED" ||
    tx.status === "VOIDED" ||
    tx.status === "ERROR"
  ) {
    // Restaurar stock que se reservó al crear el pedido PENDING
    await db.transaction(async (tx2) => {
      const items = await tx2
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        const [variant] = await tx2
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, item.productVariantId))
          .limit(1);
        if (variant) {
          await tx2
            .update(productVariants)
            .set({ stock: variant.stock + item.quantity })
            .where(eq(productVariants.id, variant.id));
        }
      }

      await tx2
        .update(orders)
        .set({
          status: "CANCELLED",
          paymentId: tx.id,
          paymentMethod: tx.payment_method_type,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
    });

    return NextResponse.json({ ok: true });
  }

  // PENDING u otros: solo registramos el paymentId si llegó.
  if (tx.id && !order.paymentId) {
    await db
      .update(orders)
      .set({ paymentId: tx.id, updatedAt: new Date() })
      .where(eq(orders.id, order.id));
  }

  return NextResponse.json({ ok: true });
}
