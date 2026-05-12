import Image from "next/image";
import Link from "next/link";
import { StoreHeader } from "@/components/StoreHeader";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Sparkles, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Nosotros — Bloom Rose Accesorios",
  description:
    "Conoce la historia detras de Bloom Rose. Accesorios artesanales disenados con amor y dedicacion.",
};

const values = [
  {
    icon: Heart,
    title: "Hecho con amor",
    description:
      "Cada pieza pasa por manos artesanas que cuidan cada detalle con dedicacion y pasion por el oficio.",
  },
  {
    icon: Leaf,
    title: "Materiales responsables",
    description:
      "Seleccionamos materiales de proveedores locales comprometidos con practicas sustentables.",
  },
  {
    icon: Sparkles,
    title: "Diseno unico",
    description:
      "Nuestros disenos nacen de la inspiracion en la naturaleza, el arte y la feminidad contemporanea.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Mas que una marca, somos una comunidad de mujeres que celebran su autenticidad a traves de los accesorios.",
  },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Sobre <span className="font-brand text-primary text-4xl sm:text-5xl lg:text-6xl">Bloom Rose</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Accesorios artesanales que cuentan historias y celebran la
            autenticidad de cada mujer.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            {/* Image */}
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-secondary lg:max-w-md">
              <Image
                src="/images/product-necklace.webp"
                alt="Artesana creando accesorios Bloom Rose"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 400px"
              />
            </div>

            {/* Copy */}
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-extra-wide text-primary sm:text-xs">
                Nuestra Historia
              </p>
              <h2 className="mt-3 font-serif text-xl text-foreground sm:text-2xl lg:text-3xl">
                De un sueno a una comunidad
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  Bloom Rose nacio en 2022 como un pequeno taller artesanal con
                  una mision clara: crear accesorios que resaltaran la belleza
                  unica de cada mujer, sin comprometer la calidad ni el
                  compromiso con el medio ambiente.
                </p>
                <p>
                  Lo que empezo como un proyecto personal, rapidamente se
                  convirtio en una comunidad de mujeres que comparten la pasion
                  por los detalles, lo artesanal y lo autentico.
                </p>
                <p>
                  Hoy, cada pieza de Bloom Rose es el resultado de un proceso
                  cuidadoso que combina tecnicas tradicionales con disenos
                  contemporaneos, utilizando materiales seleccionados a mano por
                  nuestro equipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">
              Nuestros Valores
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Lo que nos define como marca y como comunidad
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-serif text-xl text-foreground sm:text-2xl">
              ¿Lista para encontrar tu pieza favorita?
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Explora nuestra coleccion completa y encuentra los accesorios que
              complementen tu estilo.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 h-12 rounded-xl bg-foreground px-8 text-sm font-medium tracking-wide text-background hover:bg-foreground/90"
            >
              <Link href="/productos">
                Explorar Tienda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
