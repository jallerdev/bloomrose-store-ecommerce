import Link from "next/link";
import Image from "next/image";
import { StoreHeader } from "@/components/StoreHeader";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Colecciones — Bloom Rose Accesorios",
  description:
    "Explora nuestras colecciones curadas de accesorios artesanales para cada ocasion y estilo.",
};

const collections = [
  {
    name: "Primavera Dorada",
    description:
      "Tonos calidos y piezas luminosas inspiradas en los atardeceres de primavera. Oro, perlas y detalles florales.",
    image: "/products/earrings.jpg",
    count: 12,
  },
  {
    name: "Brisa del Mar",
    description:
      "Accesorios frescos y ligeros para los dias de playa. Conchas, turquesas y tejidos naturales.",
    image: "/products/bracelet.jpg",
    count: 8,
  },
  {
    name: "Noche Estelar",
    description:
      "Piezas sofisticadas con cristales y acabados oscuros. Perfectas para eventos especiales y cenas elegantes.",
    image: "/products/earrings-2.jpg",
    count: 10,
  },
  {
    name: "Espiritu Boho",
    description:
      "Accesorios con alma libre. Cuero trenzado, piedras naturales y disenos organicos llenos de personalidad.",
    image: "/products/scrunchie.jpg",
    count: 14,
  },
  {
    name: "Clasicos Eternos",
    description:
      "Las piezas que nunca pasan de moda. Aros, cadenas delicadas y anillos minimalistas en oro y plata.",
    image: "/products/ring.jpg",
    count: 16,
  },
  {
    name: "Rosa Salvaje",
    description:
      "Nuestra coleccion insignia. Disenos audaces con la delicadeza que nos define. Piezas unicas y llamativas.",
    image: "/products/necklace.jpg",
    count: 9,
  },
];

export default function ColeccionesPage() {
  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <h1 className="font-serif text-2xl text-foreground sm:text-3xl lg:text-4xl">
            Nuestras <span className="text-primary">Colecciones</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Cada coleccion cuenta una historia diferente. Encuentra la que
            resuene con tu estilo y personalidad.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.name}
                href="/products"
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg text-foreground">
                      {collection.name}
                    </h2>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                      {collection.count} piezas
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors group-hover:text-foreground">
                    Explorar coleccion
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
