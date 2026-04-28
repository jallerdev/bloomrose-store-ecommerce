import { Resend } from "resend";
import { db } from "@/lib/db";
import { orders, orderItems, profiles, productVariants, products, productImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OrderPaidEmail } from "./templates/OrderPaid";
import { OrderShippedEmail } from "./templates/OrderShipped";
import { WelcomeEmail } from "./templates/Welcome";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM = process.env.EMAIL_FROM ?? "Bloomrose <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

async function send(args: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurado — email no enviado:", args.subject);
    return { skipped: true } as const;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    react: args.react,
  });
  if (error) {
    console.error("[email] error:", error);
    throw new Error(`Resend error: ${error.message}`);
  }
  return { sent: true } as const;
}

// ─────────────────────────────────────────────────────────────────
// Bienvenida
// ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(args: {
  email: string;
  firstName: string | null;
}) {
  return send({
    to: args.email,
    subject: "Bienvenida a Bloomrose",
    react: WelcomeEmail({
      customerName: args.firstName || "amiga",
      shopUrl: `${SITE}/productos`,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Confirmación de pago (llamada desde webhook de Wompi)
// ─────────────────────────────────────────────────────────────────

export async function sendOrderPaidEmail(args: { orderId: string }) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, args.orderId))
    .limit(1);
  if (!order) throw new Error(`Order not found: ${args.orderId}`);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, order.profileId))
    .limit(1);
  if (!profile?.email) throw new Error("Profile email missing");

  // Fetch items con producto + imagen
  const items = await db
    .select({
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      variantName: productVariants.name,
      productTitle: products.title,
      productId: products.id,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  // Imagen principal de cada producto (una query a productImages por producto)
  const productIds = [...new Set(items.map((i) => i.productId))];
  const imagesRows = productIds.length
    ? await db
        .select()
        .from(productImages)
        .where(eq(productImages.displayOrder, 0))
    : [];
  const imageByProduct = new Map(
    imagesRows
      .filter((i) => productIds.includes(i.productId))
      .map((i) => [i.productId, i.url]),
  );

  return send({
    to: profile.email,
    subject: `Pedido confirmado · ${order.paymentReference}`,
    react: OrderPaidEmail({
      customerName: profile.firstName || "amiga",
      paymentReference: order.paymentReference || order.id.slice(0, 8),
      items: items.map((it) => ({
        title: it.productTitle,
        variantName: it.variantName,
        quantity: it.quantity,
        lineTotal: fmt(Number(it.priceAtPurchase) * it.quantity),
        imageUrl: imageByProduct.get(it.productId)
          ? `${SITE}${imageByProduct.get(it.productId)}`
          : null,
      })),
      subtotal: fmt(Number(order.subtotal)),
      shippingCost: fmt(Number(order.shippingCost)),
      total: fmt(Number(order.totalAmount)),
      shippingAddress: {
        line1: order.shippingAddressLine1 || "",
        line2: order.shippingAddressLine2,
        city: order.shippingCity || "",
        department: order.shippingDepartment || "",
      },
      orderUrl: `${SITE}/perfil/pedidos/${order.id}`,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Envío con tracking (llamada desde admin al cambiar a SHIPPED)
// ─────────────────────────────────────────────────────────────────

export async function sendOrderShippedEmail(args: { orderId: string }) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, args.orderId))
    .limit(1);
  if (!order) throw new Error(`Order not found: ${args.orderId}`);
  if (!order.trackingNumber) throw new Error("Order has no tracking number");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, order.profileId))
    .limit(1);
  if (!profile?.email) throw new Error("Profile email missing");

  return send({
    to: profile.email,
    subject: `Tu pedido va en camino · ${order.paymentReference}`,
    react: OrderShippedEmail({
      customerName: profile.firstName || "amiga",
      paymentReference: order.paymentReference || order.id.slice(0, 8),
      trackingNumber: order.trackingNumber,
      carrier: order.shippingCarrier,
    }),
  });
}
