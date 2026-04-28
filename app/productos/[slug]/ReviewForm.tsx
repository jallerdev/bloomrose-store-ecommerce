"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "./review-actions";

interface Props {
  productId: string;
  productSlug: string;
  initialRating?: number;
  initialComment?: string | null;
}

export function ReviewForm({
  productId,
  productSlug,
  initialRating = 0,
  initialComment = "",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment ?? "");

  const isEditing = initialRating > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Selecciona una calificación");
      return;
    }
    startTransition(async () => {
      const r = await submitReviewAction({
        productId,
        productSlug,
        rating,
        comment: comment.trim() || null,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(isEditing ? "Reseña actualizada" : "Gracias por tu reseña");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Tu calificación
        </p>
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Calificación de 1 a 5 estrellas"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hoverRating || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded-md p-0.5 transition-transform hover:scale-110"
                aria-label={`${n} estrella${n === 1 ? "" : "s"}`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    filled
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Tu comentario{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        </p>
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia con esta pieza..."
          className="border-border bg-background text-sm"
          maxLength={2000}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="self-start rounded-xl bg-foreground text-background hover:bg-foreground/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : isEditing ? (
          "Actualizar reseña"
        ) : (
          "Publicar reseña"
        )}
      </Button>
    </form>
  );
}
