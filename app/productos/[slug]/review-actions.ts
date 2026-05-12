"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

const inputSchema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export type SubmitReviewInput = z.infer<typeof inputSchema>;

export async function submitReviewAction(input: SubmitReviewInput) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { ok: false, error: "Debes iniciar sesión para dejar una reseña" } as const;

  try {
    await db
      .insert(reviews)
      .values({
        profileId: user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      })
      .onConflictDoUpdate({
        target: [reviews.profileId, reviews.productId],
        set: {
          rating: parsed.data.rating,
          comment: parsed.data.comment ?? null,
        },
      });

    revalidatePath(`/productos/${parsed.data.productSlug}`);
    revalidateTag("reviews");
    revalidateTag(`product:${parsed.data.productSlug}`);
    return { ok: true } as const;
  } catch (err) {
    console.error("[submitReviewAction]", err);
    return { ok: false, error: "No se pudo guardar la reseña" } as const;
  }
}
