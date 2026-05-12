import Link from "next/link";
import { Flower2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      {/* Background decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]"
      />

      {/* Logo */}
      <Link
        href="/"
        aria-label="Bloomrose — Inicio"
        className="mb-10 flex items-center gap-2.5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <Flower2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-brand text-3xl leading-none text-foreground">Bloomrose</span>
      </Link>

      {/* Big 404 */}
      <p className="font-serif text-[120px] font-bold leading-none text-primary/20 sm:text-[180px]">
        404
      </p>

      {/* Copy */}
      <h1 className="-mt-4 font-serif text-2xl text-foreground sm:text-3xl">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
        Quizás el enlace expiró, fue movido, o simplemente la URL tiene un
        pequeño error tipográfico.
      </p>

      {/* Decorative petal divider */}
      <div className="my-8 flex items-center gap-2 text-primary/40">
        <span className="h-px w-16 bg-primary/20" />
        <Flower2 className="h-4 w-4" />
        <span className="h-px w-16 bg-primary/20" />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
        <Link
          href="/productos"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}
