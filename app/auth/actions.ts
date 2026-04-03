"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnTo = (formData.get("returnTo") as string) || "/";

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Si login es exitoso, redirigimos a donde venía
  redirect(returnTo);
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
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
      emailRedirectTo: `${process.env.APP_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Backup Manual DB Sync in case Postgres Trigger fails.
  if (data?.user) {
    try {
      await db
        .insert(profiles)
        .values({
          id: data.user.id,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: "CUSTOMER",
        })
        .onConflictDoNothing({ target: profiles.id });
    } catch (err) {
      console.error("Failed to sync profile manually:", err);
    }
  }

  // Redirigir post-registro
  redirect(returnTo);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
