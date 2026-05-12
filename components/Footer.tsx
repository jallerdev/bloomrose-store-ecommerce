import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/image.webp"
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-brand text-2xl leading-none text-foreground">
                Bloomrose
              </span>
            </div>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              Bisutería artesanal hecha en Colombia. Piezas para mujeres que
              cuentan su propia historia.
            </p>
            <a
              href="https://instagram.com/bloomrose.store"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @bloomrose.store"
              className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>

          <FooterColumn
            title="Tienda"
            links={[
              { label: "Catálogo", href: "/productos" },
              { label: "Nuevos", href: "/nuevos" },
              { label: "Colecciones", href: "/colecciones" },
              { label: "Favoritos", href: "/favoritos" },
            ]}
          />
          <FooterColumn
            title="Bloomrose"
            links={[
              { label: "Nosotros", href: "/nosotros" },
              { label: "Mi cuenta", href: "/perfil" },
              { label: "Mis pedidos", href: "/perfil/pedidos" },
            ]}
          />
          <FooterColumn
            title="Ayuda"
            links={[
              { label: "Envíos", href: "/envios" },
              { label: "Devoluciones", href: "/devoluciones" },
              { label: "Cuidado de joyas", href: "/cuidado-de-joyas" },
              { label: "Contacto", href: "/contacto" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Bloomrose. Todos los derechos
            reservados.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Hecho con cariño en Colombia ·{" "}
            <a
              href="https://jaller-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              Jaller.Dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h4>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
