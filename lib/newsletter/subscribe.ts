import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean; emailSent: boolean }
  | { ok: false; error: string };

/**
 * Suscribe un email al newsletter de forma idempotente. Si el email ya existe,
 * no duplica ni reenvía el welcome. Si no existe, lo inserta y dispara el
 * welcome email (Netlify cancela promesas "fire-and-forget", así que esperamos).
 *
 * Reutilizado por la action pública de newsletter y por el checkout para
 * sumar suscriptores cuando marcan el opt-in al hacer compra.
 */
export async function subscribeEmail(args: {
  email: string;
  source: string;
}): Promise<SubscribeResult> {
  const email = args.email.toLowerCase().trim();
  if (!email) return { ok: false, error: "Email vacío" };

  try {
    const existing = await db
      .select({ id: newsletterSubscriptions.id })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { ok: true, alreadySubscribed: true, emailSent: false };
    }

    await db.insert(newsletterSubscriptions).values({
      email,
      source: args.source,
    });

    try {
      await sendNewsletterWelcomeEmail({ email });
      return { ok: true, alreadySubscribed: false, emailSent: true };
    } catch (err) {
      console.error("[subscribeEmail] welcome failed:", err);
      // El insert ya quedó. No revertimos por un fallo de email.
      return { ok: true, alreadySubscribed: false, emailSent: false };
    }
  } catch (err) {
    console.error("[subscribeEmail] insert failed:", err);
    return { ok: false, error: "No pudimos completar la suscripción." };
  }
}