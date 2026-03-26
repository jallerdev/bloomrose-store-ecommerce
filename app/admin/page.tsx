import { auth0 } from "@/lib/auth0";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const session = await auth0.getSession();

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-6">
        Dashboard Principal
      </h1>
      <p className="mb-8 text-muted-foreground">
        Bienvenido, {session?.user.name}
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Ventas
          </h3>
          <p className="mt-2 text-3xl font-serif text-foreground">$0.00</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Productos Activos
          </h3>
          <p className="mt-2 text-3xl font-serif text-foreground">--</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Nuevos Usuarios
          </h3>
          <p className="mt-2 text-3xl font-serif text-foreground">--</p>
        </div>
      </div>
    </div>
  );
}
