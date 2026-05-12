"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app.error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="mt-6 font-serif text-2xl text-foreground">
          Algo salió mal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tuvimos un inconveniente cargando esta página. Vuelve a intentarlo o
          regresa al inicio.
        </p>
        {error.digest && (
          <p className="mt-2 text-[11px] text-muted-foreground/70">
            Código: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
