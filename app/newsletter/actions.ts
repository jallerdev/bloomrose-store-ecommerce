"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email("Email inválido").max(255),
  source: z.string().max(50).optional(),
});

export type SubscribeState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function subscribeToNewsletter(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "home",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Email inválido",
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const source = parsed.data.source ?? "home";

  try {
    // Idempotente: si ya está suscrito, devolvemos éxito sin reenviar email
    // ni duplicar la fila.
    const existing = await db
      .select({ id: newsletterSubscriptions.id })
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1);

    if (existing.length > 0) {
      return {
        status: "success",
        message: "¡Ya estás en la lista! Te avisamos cuando haya novedades.",
      };
    }

    await db.insert(newsletterSubscriptions).values({ email, source });

    // En Netlify Functions, una promesa "fire-and-forget" se cancela cuando
    // la action retorna, así que esperamos el envío. Si falla, no revertimos
    // la suscripción (ya está guardada) pero sí avisamos en el toast para
    // poder diagnosticar sin logs.
    try {
      await sendNewsletterWelcomeEmail({ email });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      return {
        status: "success",
        message: `Te suscribimos, pero no pudimos enviarte el email de bienvenida (${detail}).`,
      };
    }

    return {
      status: "success",
      message: "¡Suscripción confirmada! Revisa tu correo.",
    };
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    return {
      status: "error",
      message: "No pudimos completar la suscripción. Intenta de nuevo.",
    };
  }
}
