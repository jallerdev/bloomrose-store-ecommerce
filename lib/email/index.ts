import { Resend } from "resend";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  profiles,
  productVariants,
  products,
  productImages,
  stockNotifications,
} from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { OrderPaidEmail } from "./templates/OrderPaid";
import { OrderShippedEmail } from "./templates/OrderShipped";
import { WelcomeEmail } from "./templates/Welcome";
import { BackInStockEmail } from "./templates/BackInStock";
import { NewsletterWelcomeEmail } from "./templates/NewsletterWelcome";
import { buildUnsubscribeUrl } from "@/lib/newsletter/token";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FROM = process.env.EMAIL_FROM ?? "Bloom Rose <onboarding@resend.dev>";
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
    subject: "Bienvenida a Bloom Rose",
    react: WelcomeEmail({
      customerName: args.firstName || "amiga",
      shopUrl: `${SITE}/productos`,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// Confirmación de suscripción al newsletter
// ─────────────────────────────────────────────────────────────────

export async function sendNewsletterWelcomeEmail(args: { email: string }) {
  return send({
    to: args.email,
    subject: "Te damos la bienvenida a Bloom Rose 💌",
    react: NewsletterWelcomeEmail({
      siteUrl: SITE,
      shopUrl: `${SITE}/productos`,
      unsubscribeUrl: buildUnsubscribeUrl(SITE, args.email),
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

  // Resolver destinatario y nombre: del perfil si es de un usuario registrado,
  // o del snapshot del pedido si es un guest checkout.
  const [profile] = order.profileId
    ? await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, order.profileId))
        .limit(1)
    : [];
  const recipientEmail = profile?.email ?? order.guestEmail ?? null;
  if (!recipientEmail) throw new Error("Order has no contact email");
  const recipientName =
    profile?.firstName ||
    order.shippingFullName?.split(" ")[0] ||
    "amiga";

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
    to: recipientEmail,
    subject: `Pedido confirmado · ${order.paymentReference}`,
    react: OrderPaidEmail({
      customerName: recipientName,
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
      giftWrapCost:
        Number(order.giftWrapCost) > 0
          ? fmt(Number(order.giftWrapCost))
          : null,
      giftMessage: order.giftMessage,
      total: fmt(Number(order.totalAmount)),
      shippingAddress: {
        line1: order.shippingAddressLine1 || "",
        line2: order.shippingAddressLine2,
        city: order.shippingCity || "",
        department: order.shippingDepartment || "",
      },
      // Para guests apuntamos a la página de pago (pública por orderId);
      // para usuarios autenticados, a la página de mis pedidos.
      orderUrl: profile
        ? `${SITE}/perfil/pedidos/${order.id}`
        : `${SITE}/checkout/pago/${order.id}`,
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

  const [profile] = order.profileId
    ? await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, order.profileId))
        .limit(1)
    : [];
  const recipientEmail = profile?.email ?? order.guestEmail ?? null;
  if (!recipientEmail) throw new Error("Order has no contact email");
  const recipientName =
    profile?.firstName ||
    order.shippingFullName?.split(" ")[0] ||
    "amiga";

  return send({
    to: recipientEmail,
    subject: `Tu pedido va en camino · ${order.paymentReference}`,
    react: OrderShippedEmail({
      customerName: recipientName,
      paymentReference: order.paymentReference || order.id.slice(0, 8),
      trackingNumber: order.trackingNumber,
      carrier: order.shippingCarrier,
    }),
  });
}

// ─────────────────────────────────────────────────────────────────
// "Avísame cuando llegue" — envía a todos los suscriptores pendientes
// del producto y los marca como notificados.
// ─────────────────────────────────────────────────────────────────

export async function notifyBackInStock(productId: string) {
  const pending = await db
    .select()
    .from(stockNotifications)
    .where(
      and(
        eq(stockNotifications.productId, productId),
        isNull(stockNotifications.notifiedAt),
      ),
    );
  if (pending.length === 0) return { sent: 0 };

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return { sent: 0 };

  const [firstImage] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.displayOrder)
    .limit(1);

  const productUrl = `${SITE}/productos/${product.slug}`;
  const productImage = firstImage?.url
    ? firstImage.url.startsWith("http")
      ? firstImage.url
      : `${SITE}${firstImage.url}`
    : null;

  let sent = 0;
  for (const sub of pending) {
    try {
      await send({
        to: sub.email,
        subject: `${product.title} ya está disponible`,
        react: BackInStockEmail({
          productTitle: product.title,
          productImage,
          productUrl,
        }),
      });
      await db
        .update(stockNotifications)
        .set({ notifiedAt: new Date() })
        .where(eq(stockNotifications.id, sub.id));
      sent++;
    } catch (err) {
      console.error(
        "[notifyBackInStock] error enviando aviso",
        sub.id,
        err,
      );
    }
  }
  return { sent };
}
