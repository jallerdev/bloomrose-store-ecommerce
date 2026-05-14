"use server";

import { z } from "zod";

import { subscribeEmail } from "@/lib/newsletter/subscribe";

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

  const result = await subscribeEmail({
    email: parsed.data.email,
    source: parsed.data.source ?? "home",
  });

  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  if (result.alreadySubscribed) {
    return {
      status: "success",
      message: "¡Ya estás en la lista! Te avisamos cuando haya novedades.",
    };
  }

  if (!result.emailSent) {
    return {
      status: "success",
      message:
        "Te suscribimos, pero no pudimos enviarte el email de bienvenida ahora. Llegará pronto.",
    };
  }

  return {
    status: "success",
    message: "¡Suscripción confirmada! Revisa tu correo.",
  };
}