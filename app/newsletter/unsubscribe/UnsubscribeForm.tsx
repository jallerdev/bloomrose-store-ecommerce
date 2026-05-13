"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { unsubscribeAction, type UnsubscribeState } from "./actions";

const INITIAL: UnsubscribeState = { status: "idle" };

interface Props {
  email: string;
  token: string;
}

export function UnsubscribeForm({ email, token }: Props) {
  const [state, formAction, pending] = useActionState(
    unsubscribeAction,
    INITIAL,
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl text-foreground">Listo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Te dimos de baja del newsletter. No volveremos a escribirte desde
            aquí.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Volver al sitio</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center"
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />

      <p className="text-sm text-muted-foreground">
        Vas a darte de baja del correo:
      </p>
      <p className="break-all font-medium text-foreground">{email}</p>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={pending} className="min-w-[180px]">
          {pending ? "Procesando..." : "Confirmar baja"}
        </Button>
        <Button asChild variant="outline" disabled={pending}>
          <Link href="/">Cancelar</Link>
        </Button>
      </div>

      {state.status === "error" && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
