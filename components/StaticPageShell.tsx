import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StoreHeader } from "@/components/StoreHeader";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Fecha de última actualización en formato libre, ej. "Abril 2026". */
  lastUpdated?: string;
  /** Migas: lista de pares [label, href]. La última se muestra como texto plano. */
  breadcrumb?: { label: string; href?: string }[];
  children: React.ReactNode;
}

/**
 * Wrapper común para páginas estáticas (políticas, contacto, términos).
 * Asegura misma anchura, breadcrumb, header y tipografía consistentes.
 */
export function StaticPageShell({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  breadcrumb,
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Migas de pan"
            className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {breadcrumb.map((b, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <span
                  key={`${b.label}-${i}`}
                  className="flex items-center gap-1.5"
                >
                  {b.href && !isLast ? (
                    <Link
                      href={b.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{b.label}</span>
                  )}
                  {!isLast && <ChevronRight className="h-3 w-3" />}
                </span>
              );
            })}
          </nav>
        )}

        <header className="mb-8 border-b border-border pb-8">
          {eyebrow && (
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-extra-wide text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-4 text-xs text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          )}
        </header>

        <article className="prose prose-sm max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-h2:mt-10 prose-h2:text-xl prose-h2:sm:text-2xl prose-h3:text-base prose-h3:sm:text-lg prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
          {children}
        </article>
      </div>
    </main>
  );
}
