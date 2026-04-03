import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CustomerTableActions } from "./CustomerTableActions";

export const metadata = { title: "Clientes — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const clientes = await db.query.profiles.findMany({
    with: { orders: true },
    orderBy: [desc(profiles.createdAt)],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{" "}
          registrados
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cliente
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                Teléfono
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pedidos
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                Rol
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                Registrado
              </th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  No hay clientes aún.
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-secondary/20"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {c.firstName?.[0] || c.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {c.firstName
                            ? `${c.firstName} ${c.lastName ?? ""}`.trim()
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs text-muted-foreground sm:table-cell">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm font-medium text-foreground">
                    {c.orders.length}
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        c.role === "ADMIN"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs text-muted-foreground lg:table-cell">
                    {new Date(c.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <CustomerTableActions
                      userId={c.id}
                      userRole={c.role}
                      userEmail={c.email}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
