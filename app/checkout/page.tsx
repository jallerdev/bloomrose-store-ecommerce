import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreHeader } from "@/components/StoreHeader";
import { ShoppingBag, Lock } from "lucide-react";

export const metadata = { title: "Checkout — Bloom Rose" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/checkout");

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground">
            Finalizar Compra
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Pago 100% seguro
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border bg-card py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-serif text-xl text-foreground">Próximamente</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              El módulo de pago está en desarrollo. Muy pronto podrás completar
              tu compra directamente aquí.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
