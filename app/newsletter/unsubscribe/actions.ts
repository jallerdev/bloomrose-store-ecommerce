"use server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { verifyToken } from "@/lib/newsletter/token";

export type UnsubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function unsubscribeAction(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const token = String(formData.get("token") ?? "");

  if (!verifyToken(email, token)) {
    return { status: "error", message: "Enlace inválido o caducado." };
  }

  try {
    await db
      .delete(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));
    return { status: "success" };
  } catch (err) {
    console.error("[unsubscribe] failed:", err);
    return {
      status: "error",
      message: "No pudimos completar la baja. Intenta de nuevo.",
    };
  }
}
