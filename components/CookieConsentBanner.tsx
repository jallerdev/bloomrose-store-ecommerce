"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage no disponible (modo privado) — no mostramos el banner.
    }
  }, []);

  function decide(choice: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignorado: sin persistencia simplemente no recordamos la elección.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Usamos cookies técnicas para que el carrito y tu sesión funcionen, y
          cookies analíticas anónimas para mejorar el sitio. Puedes aceptarlas o
          rechazarlas. Más detalles en nuestra{" "}
          <Link
            href="/privacidad"
            className="text-primary underline-offset-4 hover:underline"
          >
            política de privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => decide("rejected")}
          >
            Rechazar
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => decide("accepted")}
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
