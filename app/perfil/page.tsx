import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreHeader } from "@/components/StoreHeader";
import { User, MapPin, ShoppingBag, Settings } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mi Perfil — Bloomrose" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/perfil");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName ?? ""}`.trim()
    : user.email;

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {profile?.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/perfil/configuracion"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-secondary/20"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Configuración</p>
              <p className="text-xs text-muted-foreground">
                Edita tu nombre, teléfono y más
              </p>
            </div>
          </Link>

          <Link
            href="/perfil/pedidos"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-secondary/20"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Mis Pedidos</p>
              <p className="text-xs text-muted-foreground">
                Historial y estado de tus compras
              </p>
            </div>
          </Link>

          <Link
            href="/perfil/direcciones"
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-secondary/20"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Mis Direcciones</p>
              <p className="text-xs text-muted-foreground">
                Gestiona tus direcciones de envío
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
