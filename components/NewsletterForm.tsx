"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  subscribeToNewsletter,
  type SubscribeState,
} from "@/app/newsletter/actions";

const initial: SubscribeState = { status: "idle" };

export function NewsletterForm({ source = "home" }: { source?: string }) {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initial,
  );

  return (
    <div>
      <form
        action={formAction}
        className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <input type="hidden" name="source" value={source} />
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          aria-label="Tu correo electrónico"
          disabled={pending || state.status === "success"}
          className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        />
        <Button
          type="submit"
          size="lg"
          disabled={pending || state.status === "success"}
          className="h-12 rounded-xl bg-foreground px-8 text-sm font-medium text-background hover:bg-foreground/90"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state.status === "success" ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Listo
            </>
          ) : (
            "Suscribirme"
          )}
        </Button>
      </form>

      {state.status === "success" && (
        <p
          role="status"
          className="mt-3 text-xs font-medium text-emerald-600 sm:text-sm"
        >
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p
          role="alert"
          className="mt-3 text-xs font-medium text-destructive sm:text-sm"
        >
          {state.message}
        </p>
      )}

      <p
        className={cn(
          "mt-3 text-[10px] text-muted-foreground",
          state.status !== "idle" && "mt-2",
        )}
      >
        Al suscribirte aceptas recibir correos ocasionales. Te puedes dar de
        baja cuando quieras.
      </p>
    </div>
  );
}
