"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/email";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bloomroseaccesorios.com";

// ─────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first?.message ?? "Datos inválidos" };
  }

  const returnTo = (formData.get("returnTo") as string) || "/";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Mapear mensajes de Supabase a español sin perder información útil.
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email o contraseña incorrectos" };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "Tu correo no está verificado. Revisa la bandeja de entrada.",
      };
    }
    return { error: error.message };
  }

  redirect(returnTo);
}

// ─────────────────────────────────────────────────────────────────
// Signup
// ─────────────────────────────────────────────────────────────────

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on" ? true : undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { error: first?.message ?? "Datos inválidos" };
  }
  const { firstName, lastName, email, password } = parsed.data;
  const returnTo = (formData.get("returnTo") as string) || "/";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(
        returnTo,
      )}`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email" };
    }
    return { error: error.message };
  }

  // Backup manual sync por si el trigger Postgres no corre.
  if (data?.user) {
    try {
      await db
        .insert(profiles)
        .values({
          id: data.user.id,
          email,
          firstName,
          lastName,
          role: "CUSTOMER",
        })
        .onConflictDoNothing({ target: profiles.id });
    } catch (err) {
      console.error("Failed to sync profile manually:", err);
    }

    sendWelcomeEmail({ email, firstName }).catch((e) =>
      console.error("Welcome email failed:", e),
    );
  }

  // Si Supabase requiere verificación, redirigimos a una pantalla informativa.
  // Si la verificación está OFF, hay sesión creada y vamos directo al destino.
  if (data?.session) {
    redirect(returnTo);
  } else {
    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ─────────────────────────────────────────────────────────────────
// Forgot password
// ─────────────────────────────────────────────────────────────────

export async function requestPasswordResetAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Email inválido" };
  }

  const supabase = await createClient();
  // Nunca revelamos si el email existe o no — siempre devolvemos OK.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/reset-password`,
  });

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// Reset password (cuando el usuario llega del link del email)
// ─────────────────────────────────────────────────────────────────

export async function updatePasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Contraseña inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "El enlace de recuperación expiró o no es válido. Solicita uno nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  return { ok: true };
}
