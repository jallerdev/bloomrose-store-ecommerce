import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { DireccionesClient } from "./DireccionesClient";

export const metadata = { title: "Mis direcciones" };
export const dynamic = "force-dynamic";

export default async function DireccionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/perfil/direcciones");

  const myAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.profileId, user.id))
    .orderBy(desc(addresses.isDefault), desc(addresses.id));

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-foreground">
              Mis direcciones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra las direcciones donde recibes tus pedidos.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/perfil">Volver al perfil</Link>
          </Button>
        </div>

        <DireccionesClient
          addresses={myAddresses.map((a) => ({
            id: a.id,
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            isDefault: a.isDefault,
          }))}
        />
      </div>
    </main>
  );
}
