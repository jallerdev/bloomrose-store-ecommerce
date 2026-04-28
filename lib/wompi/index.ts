import { createHash, createHmac, timingSafeEqual } from "crypto";

// ─────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────

const WOMPI_CHECKOUT_URL = "https://checkout.wompi.co/p/";
const WOMPI_API_URL =
  process.env.WOMPI_API_URL ?? "https://production.wompi.co/v1";

export const WOMPI_CURRENCY = "COP";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} no está configurada en .env.local`);
  return v;
}

// ─────────────────────────────────────────────────────────────────
// Firma de integridad para Web Checkout
// ─────────────────────────────────────────────────────────────────

/**
 * Genera la firma de integridad que Wompi requiere en la URL del Web Checkout.
 * Fórmula: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function buildIntegritySignature(input: {
  reference: string;
  amountInCents: number;
  currency: string;
  integritySecret: string;
}): string {
  const data = `${input.reference}${input.amountInCents}${input.currency}${input.integritySecret}`;
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Construye la URL completa del Web Checkout de Wompi para un pedido dado.
 * El usuario es redirigido a esta URL y completa el pago en el dominio de Wompi.
 */
export function buildCheckoutUrl(input: {
  reference: string;
  amountCop: number; // en pesos (no centavos); aquí lo convertimos
  redirectUrl: string;
  customerEmail?: string;
  customerFullName?: string;
  customerPhone?: string;
}): string {
  const publicKey = requireEnv("WOMPI_PUBLIC_KEY");
  const integritySecret = requireEnv("WOMPI_INTEGRITY_SECRET");

  const amountInCents = Math.round(input.amountCop * 100);
  const signature = buildIntegritySignature({
    reference: input.reference,
    amountInCents,
    currency: WOMPI_CURRENCY,
    integritySecret,
  });

  const params = new URLSearchParams({
    "public-key": publicKey,
    currency: WOMPI_CURRENCY,
    "amount-in-cents": String(amountInCents),
    reference: input.reference,
    "signature:integrity": signature,
    "redirect-url": input.redirectUrl,
  });

  if (input.customerEmail) params.set("customer-data:email", input.customerEmail);
  if (input.customerFullName)
    params.set("customer-data:full-name", input.customerFullName);
  if (input.customerPhone)
    params.set("customer-data:phone-number", input.customerPhone);

  return `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────
// Verificación de webhooks
// ─────────────────────────────────────────────────────────────────

/**
 * Verifica el checksum que envía Wompi en el body del webhook.
 * Doc: https://docs.wompi.co/docs/colombia/eventos/
 *
 * Wompi calcula: SHA256(<concat-de-properties> + timestamp + eventsSecret)
 * y lo manda en `signature.checksum` dentro del body.
 *
 * Las `properties` son los nombres de campos que Wompi indica (en `signature.properties`)
 * y se leen del objeto `data` siguiendo el path con puntos.
 */
export function verifyWebhookChecksum(body: WompiWebhookBody): boolean {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) return false;

  const { signature, timestamp, data } = body;
  if (!signature?.checksum || !signature.properties || !timestamp || !data) {
    return false;
  }

  const concatenated =
    signature.properties
      .map((path) => readPath(data, path))
      .filter((v) => v !== undefined && v !== null)
      .join("") + String(timestamp);

  const expected = createHash("sha256")
    .update(concatenated + eventsSecret)
    .digest("hex");

  // Comparación constante en tiempo
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.checksum, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// ─────────────────────────────────────────────────────────────────
// Tipos del payload de webhook (subset que usamos)
// ─────────────────────────────────────────────────────────────────

export interface WompiWebhookBody {
  event: string; // "transaction.updated"
  data: {
    transaction: WompiTransaction;
  };
  sent_at: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
  environment: "test" | "prod";
}

export interface WompiTransaction {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
  status_message?: string;
  payment_method_type: string;
  payment_method?: Record<string, unknown>;
  customer_email?: string;
  created_at: string;
  finalized_at?: string;
}

// ─────────────────────────────────────────────────────────────────
// Consultas server-side a la API de Wompi (opcional, para reconciliación)
// ─────────────────────────────────────────────────────────────────

export async function getTransactionById(
  transactionId: string,
): Promise<WompiTransaction | null> {
  const res = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${requireEnv("WOMPI_PRIVATE_KEY")}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: WompiTransaction };
  return json.data;
}
