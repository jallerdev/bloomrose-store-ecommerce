import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { addresses, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { Lock } from "lucide-react";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Checkout — Bloom Rose" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/checkout");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.profileId, user.id));

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground">
            Finalizar Compra
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Pago 100% seguro · Envíos por Coordinadora
          </p>
        </div>

        <CheckoutClient
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
            email: profile?.email ?? user.email ?? "",
          }}
        />
      </div>
    </main>
  );
}
