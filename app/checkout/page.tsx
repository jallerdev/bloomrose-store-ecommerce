import Link from "next/link";
import { eq } from "drizzle-orm";
import { Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { addresses, profiles } from "@/lib/db/schema";
import { StoreHeader } from "@/components/StoreHeader";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Checkout · Bloomrose" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si hay sesión: cargamos perfil + direcciones guardadas.
  // Si no hay sesión: continuamos como guest.
  const [profile] = user
    ? await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
    : [];

  const userAddresses = user
    ? await db.select().from(addresses).where(eq(addresses.profileId, user.id))
    : [];

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground">
            Finalizar compra
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Pago 100% seguro · Envíos por Coordinadora
          </p>
        </div>

        {/* Banner para guest */}
        {!user && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login?returnTo=/checkout"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Inicia sesión
              </Link>{" "}
              para usar tus direcciones guardadas.
            </p>
            <p className="text-xs text-muted-foreground">
              También puedes comprar sin cuenta.
            </p>
          </div>
        )}

        <CheckoutClient
          isGuest={!user}
          addresses={userAddresses.map((a) => ({
            id: a.id,
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            isDefault: a.isDefault,
          }))}
          defaultContact={{
            fullName:
              [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
              "",
            phone: profile?.phone ?? "",
            email: profile?.email ?? user?.email ?? "",
          }}
        />
      </div>
    </main>
  );
}
