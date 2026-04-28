import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { orders, profiles } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?returnTo=/admin");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { role: true, firstName: true, email: true },
  });

  if (profile?.role !== "ADMIN") redirect("/");

  const [pending] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, "PAID"));
  const pendingOrdersCount = Number(pending?.count ?? 0);

  return (
    <AdminShell
      user={{
        firstName: profile?.firstName ?? null,
        email: profile?.email ?? user.email ?? "",
      }}
      pendingOrdersCount={pendingOrdersCount}
      greeting={greeting()}
    >
      {children}
    </AdminShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
