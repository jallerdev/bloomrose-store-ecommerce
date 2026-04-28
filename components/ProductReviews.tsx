import Link from "next/link";
import { Star } from "lucide-react";

import { db } from "@/lib/db";
import { profiles, reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/app/productos/[slug]/ReviewForm";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  productSlug: string;
}

export async function ProductReviews({ productId, productSlug }: Props) {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      profileId: reviews.profileId,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(reviews)
    .leftJoin(profiles, eq(reviews.profileId, profiles.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const myReview = user ? rows.find((r) => r.profileId === user.id) : undefined;

  const total = rows.length;
  const avg =
    total === 0
      ? 0
      : rows.reduce((acc, r) => acc + r.rating, 0) / total;

  // Distribución de estrellas
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = rows.filter((r) => r.rating === star).length;
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return { star, count, pct };
  });

  return (
    <section
      aria-label="Reseñas"
      className="border-t border-border pt-12"
      id="resenas"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            Reseñas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? "Sé la primera en dejar tu opinión sobre esta pieza."
              : `${total} ${total === 1 ? "reseña" : "reseñas"} de clientes verificadas.`}
          </p>
        </div>
      </div>

      {/* Resumen */}
      {total > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 sm:items-start">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-5xl text-foreground">
                {avg.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
            <div className="flex gap-0.5" aria-label={`${avg.toFixed(1)} de 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.round(avg)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted",
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en {total} {total === 1 ? "opinión" : "opiniones"}
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {distribution.map((d) => (
              <li
                key={d.star}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="flex w-12 items-center gap-1">
                  {d.star}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums">
                  {d.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario o CTA login */}
      <div className="mb-10">
        {user ? (
          <ReviewForm
            productId={productId}
            productSlug={productSlug}
            initialRating={myReview?.rating}
            initialComment={myReview?.comment}
          />
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Inicia sesión para compartir tu opinión sobre esta pieza.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/auth/login?returnTo=/productos/${productSlug}`}>
                Iniciar sesión
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Lista de reseñas */}
      {rows.length > 0 && (
        <ul className="flex flex-col gap-6">
          {rows.map((r) => {
            const name =
              [r.firstName, r.lastName].filter(Boolean).join(" ").trim() ||
              "Cliente Bloomrose";
            const initials = (
              (r.firstName?.[0] ?? "") + (r.lastName?.[0] ?? "")
            ).toUpperCase() || "B";
            return (
              <li
                key={r.id}
                className="flex gap-4 border-b border-border pb-6 last:border-0"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-medium text-foreground">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {name}
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {r.comment}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
