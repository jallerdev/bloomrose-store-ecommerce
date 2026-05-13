import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Cuidado de tus piezas",
  description:
    "Consejos para mantener tus accesorios Bloom Rose como nuevos. Cuidados, limpieza y almacenamiento.",
  alternates: { canonical: "/cuidado-de-joyas" },
};

export default function CuidadoPage() {
  return (
    <StaticPageShell
      eyebrow="Guía"
      title="Cuidado de tus piezas"
      subtitle="Pequeños hábitos que hacen que duren años."
      lastUpdated="Abril 2026"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Cuidado de joyas" },
      ]}
    >
      <p>
        Aunque trabajamos con materiales de calidad (acero inoxidable, plata
        925, baño en oro de 18k, perlas cultivadas), todos los accesorios
        necesitan cuidados básicos para conservarse intactos.
      </p>

      <h2>Lo que evita oxidación y opacado</h2>
      <ul>
        <li>
          <strong>No te bañes con tus piezas.</strong> El cloro y el agua salada
          son especialmente agresivos.
        </li>
        <li>
          <strong>No las uses al hacer ejercicio.</strong> El sudor acelera la
          oxidación, sobre todo en aleaciones bañadas.
        </li>
        <li>
          <strong>Aplica perfumes, cremas y maquillaje primero.</strong> Espera
          unos minutos antes de ponerte tus accesorios para que los productos
          se absorban.
        </li>
        <li>
          <strong>Quítatelas para dormir.</strong> Evita que se enreden o se
          dañen mientras te mueves.
        </li>
      </ul>

      <h2>Limpieza</h2>
      <ul>
        <li>
          Pasa un <strong>paño suave y seco</strong> después de cada uso para
          eliminar restos de sudor y aceites.
        </li>
        <li>
          Si una pieza queda opaca, frótala suavemente con un paño de
          microfibra. <strong>No uses químicos abrasivos</strong> ni paños
          pulidores diseñados para joyas finas (pueden raspar el baño).
        </li>
        <li>
          Para perlas y cristales, basta con un paño húmedo y seca de
          inmediato.
        </li>
      </ul>

      <h2>Almacenamiento</h2>
      <ul>
        <li>
          Guarda cada pieza en su <strong>bolsita individual</strong> o en un
          joyero con compartimentos separados. Esto evita que se rayen entre
          ellas.
        </li>
        <li>
          Los collares se conservan mejor colgados o sin doblar para que no se
          enreden.
        </li>
        <li>Mantén las piezas alejadas de la luz solar directa y la humedad.</li>
      </ul>

      <h2>Cuidados específicos</h2>
      <h3>Acero inoxidable</h3>
      <p>
        Es el material más resistente. Aún así, evita el contacto prolongado
        con cloro y limpia tras el uso.
      </p>

      <h3>Plata 925</h3>
      <p>
        Tiende a oscurecerse con el tiempo (es una reacción natural del azufre
        del aire con la plata). Una limpieza con paño de microfibra recupera el
        brillo.
      </p>

      <h3>Baño en oro 18k</h3>
      <p>
        El baño es una capa fina sobre otra aleación. Es la pieza más delicada:
        sigue al pie de la letra los cuidados generales para que el baño dure
        más.
      </p>

      <h3>Cuero</h3>
      <p>
        Mantenlo lejos del agua y la humedad excesiva. Si se moja, sécalo a
        temperatura ambiente, nunca con calor directo.
      </p>

      <p className="mt-8">
        Si tu pieza llega con un{" "}
        <strong>defecto de fábrica</strong>, tienes 5 días desde la entrega para
        reportarlo y la reemplazamos sin costo. Detalles en{" "}
        <a href="/devoluciones">devoluciones</a>.
      </p>
    </StaticPageShell>
  );
}
