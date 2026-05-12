import { count, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { couponRedemptions, coupons } from "@/lib/db/schema";

import { CouponsClient } from "./CouponsClient";

export const metadata = { title: "Cupones — Admin Bloom Rose" };
export const dynamic = "force-dynamic";

export default async function AdminCuponesPage() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  // Conteo de redenciones por cupón en una sola query.
  const usage = await db
    .select({
      couponId: couponRedemptions.couponId,
      n: count(couponRedemptions.id),
    })
    .from(couponRedemptions)
    .groupBy(couponRedemptions.couponId);
  const usageMap = new Map(usage.map((u) => [u.couponId, Number(u.n)]));

  const data = rows.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description ?? "",
    type: c.type as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
    value: Number(c.value),
    minPurchase: c.minPurchase != null ? Number(c.minPurchase) : null,
    maxUses: c.maxUses,
    maxUsesPerUser: c.maxUsesPerUser,
    startsAt: c.startsAt.toISOString().slice(0, 10),
    expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
    isActive: c.isActive,
    appliesTo: c.appliesTo as "ALL" | "CATEGORY" | "PRODUCT",
    targetIds: c.targetIds ?? [],
    redemptions: usageMap.get(c.id) ?? 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Cupones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea y administra códigos de descuento.
        </p>
      </div>

      <CouponsClient coupons={data} />
    </div>
  );
}
