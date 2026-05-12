import { Users } from "lucide-react";
import { desc, ilike, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { CustomerTableActions } from "./CustomerTableActions";
import { TableSearch } from "@/components/admin/TableSearch";

export const metadata = { title: "Clientes — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim();

  const clientes = await db.query.profiles.findMany({
    with: { orders: true },
    where: q
      ? or(
          ilike(profiles.email, `%${q}%`),
          ilike(profiles.firstName, `%${q}%`),
          ilike(profiles.lastName, `%${q}%`),
          ilike(profiles.phone, `%${q}%`),
        )
      : undefined,
    orderBy: [desc(profiles.createdAt)],
  });

  const adminCount = clientes.filter((c) => c.role === "ADMIN").length;
  const customerCount = clientes.length - adminCount;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientes.length} cuenta{clientes.length !== 1 ? "s" : ""}
          {!q && (
            <> · {customerCount} clientes · {adminCount} admins</>
          )}
        </p>
      </div>

      <div className="mb-4">
        <TableSearch placeholder="Buscar por nombre, email o teléfono..." />
      </div>

      {clientes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {q ? `No hay resultados para "${q}".` : "Aún no hay clientes."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <Th>Cliente</Th>
                <Th className="hidden sm:table-cell">Teléfono</Th>
                <Th className="text-center">Pedidos</Th>
                <Th className="hidden md:table-cell">Rol</Th>
                <Th className="hidden lg:table-cell">Registrado</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xs font-bold text-primary-foreground">
                        {(c.firstName?.[0] || c.email[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {[c.firstName, c.lastName]
                            .filter(Boolean)
                            .join(" ") || "—"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium tabular-nums text-foreground">
                    {c.orders.length}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        c.role === "ADMIN"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {new Date(c.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CustomerTableActions
                      userId={c.id}
                      userRole={c.role}
                      userEmail={c.email}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
