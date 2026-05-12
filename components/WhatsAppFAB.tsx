"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  /** Número con código país, ej. "573001234567". Si vacío, no renderiza. */
  phoneNumber: string;
  /** Mensaje pre-cargado cuando se abre el chat. */
  defaultMessage?: string;
  /** Si está abierto el chat bot (en ese caso oculta el botón para no chocar). */
  isChatOpen?: boolean;
}

/**
 * Botón flotante de WhatsApp en bottom-right (bottom-left si hay otro FAB).
 * Se oculta automáticamente en `/admin/*` y en pantallas de auth.
 */
export function WhatsAppFAB({
  phoneNumber,
  defaultMessage = "Hola Bloom Rose, tengo una consulta",
  isChatOpen,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted || !phoneNumber) return null;

  // Rutas donde NO mostramos el botón
  const hide =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/checkout/pago");
  if (hide || isChatOpen) return null;

  const url = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    defaultMessage,
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105",
        "h-12 w-12 sm:h-14 sm:w-14",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 sm:h-7 sm:w-7"
        fill="currentColor"
        aria-hidden
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
      </svg>
    </a>
  );
}
