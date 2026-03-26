import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  let userProfile = await db.query.profiles.findFirst({
    where: eq(profiles.auth0Id, session.user.sub),
  });

  // Automatically insert user profile if they don't exist
  if (!userProfile && session.user.email) {
    [userProfile] = await db
      .insert(profiles)
      .values({
        auth0Id: session.user.sub,
        email: session.user.email,
        fullName: session.user.name || session.user.nickname,
        avatarUrl: session.user.picture,
        role: "user", // Default role
      })
      .returning();
  }

  if (userProfile?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground">
            Acceso Denegado
          </h1>
          <p className="mt-4 text-muted-foreground">
            No tienes permisos de administrador.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-primary hover:underline"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <h2 className="font-serif text-xl text-foreground mb-8 text-primary">
          Admin Panel
        </h2>
        <nav className="flex flex-col gap-4 flex-1 text-sm font-medium">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="text-muted-foreground hover:text-foreground"
          >
            Productos
          </Link>
          <Link
            href="/admin/categories"
            className="text-muted-foreground hover:text-foreground"
          >
            Categorías
          </Link>
        </nav>
        <div className="pt-8 border-t border-border mt-auto">
          <Link
            href="/"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
