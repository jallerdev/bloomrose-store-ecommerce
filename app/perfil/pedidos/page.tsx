import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { StoreHeader } from "@/components/StoreHeader";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mis pedidos — Bloomrose" };
export const dynamic = "force-dynamic";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export default async function MisPedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?returnTo=/perfil/pedidos");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.profileId, user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Mis pedidos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Historial completo de tus compras.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/perfil">Volver al perfil</Link>
          </Button>
        </div>

        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-serif text-lg text-foreground">
              Aún no tienes pedidos
            </p>
            <Button asChild className="mt-2">
              <Link href="/productos">Explorar catálogo</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {myOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/perfil/pedidos/${o.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {o.paymentReference}
                      </span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">
                      {fmt(Number(o.totalAmount))}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
