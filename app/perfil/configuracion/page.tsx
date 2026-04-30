import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreHeader } from "@/components/StoreHeader";
import Link from "next/link";
import { ProfileSettingsForm } from "@/app/perfil/configuracion/ProfileSettingsForm";

export const metadata = { title: "Configuración — Bloomrose" };

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/perfil/configuracion");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/perfil"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Mi Perfil
        </Link>
        <h1 className="mt-3 font-serif text-2xl text-foreground">
          Configuración de cuenta
        </h1>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">{user.email}</p>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-5 font-serif text-lg text-foreground">
            Información personal
          </h2>
          <ProfileSettingsForm
            userId={user.id}
            defaultValues={{
              firstName: profile?.firstName ?? "",
              lastName: profile?.lastName ?? "",
              phone: profile?.phone ?? "",
            }}
          />
        </div>
      </div>
    </main>
  );
}
