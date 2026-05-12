"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin.error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="mt-4 font-serif text-xl text-foreground">
        Error en el panel de administración
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ocurrió un error inesperado al cargar esta sección. Revisa la consola
        para más detalles.
      </p>
      {error.digest && (
        <p className="mt-2 text-[11px] text-muted-foreground/70">
          Código: <span className="font-mono">{error.digest}</span>
        </p>
      )}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={reset} size="sm" className="gap-2">
          <RotateCw className="h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/admin">Volver al dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
