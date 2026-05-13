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
          className="h-[60px] flex-1 rounded-2xl border-2 border-foreground/15 bg-card px-5 text-lg text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-60 sm:h-12 sm:rounded-xl sm:border sm:border-border sm:bg-background sm:px-4 sm:text-sm sm:shadow-none sm:focus:ring-2 p-3"
        />
        <Button
          type="submit"
          disabled={pending || state.status === "success"}
          className="h-[60px] rounded-2xl bg-foreground px-8 text-lg font-semibold text-background shadow-sm hover:bg-foreground/90 sm:h-12 sm:rounded-xl sm:text-sm sm:font-medium sm:shadow-none"
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
