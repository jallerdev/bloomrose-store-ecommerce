"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer";

// Rutas donde NO queremos mostrar el footer:
// - /admin/* : el panel administrativo tiene su propio chrome
// - /checkout/* : el checkout debe minimizar distracciones para conversión
const EXCLUDED_PREFIXES = ["/admin", "/checkout"];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <Footer />;
}
