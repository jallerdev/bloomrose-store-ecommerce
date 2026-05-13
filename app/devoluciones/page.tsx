import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Devoluciones",
  description:
    "Política de devoluciones de Bloom Rose Accesorios. Solo aceptamos devoluciones por defectos de fábrica.",
  alternates: { canonical: "/devoluciones" },
};

export default function DevolucionesPage() {
  return (
    <StaticPageShell
      eyebrow="Información"
      title="Política de devoluciones"
      subtitle="Solo aceptamos devoluciones por defectos de fábrica."
      lastUpdated="Mayo 2026"
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Devoluciones" }]}
    >
      <h2>Política general</h2>
      <p>
        En Bloom Rose Accesorios cada pieza se revisa antes de despacharse. Por
        eso{" "}
        <strong>
          solo aceptamos devoluciones cuando la pieza presenta un defecto de
          fábrica
        </strong>
        . Por ahora no manejamos cambios por talla, color o modelo, ni
        devoluciones por cambio de preferencia.
      </p>

      <h2>¿Qué se considera defecto de fábrica?</h2>
      <ul>
        <li>
          La pieza llega rota o con daños no atribuibles al envío (problemas de
          envío los gestiona la transportadora aparte).
        </li>
        <li>
          El armado está mal (cierre roto, eslabones sueltos, pegamento visible,
          piedras flojas, baño desprendido al desempacar).
        </li>
        <li>
          El producto entregado no corresponde al que pediste (color, modelo o
          referencia equivocada).
        </li>
      </ul>

      <h2>Qué NO califica como devolución</h2>
      <ul>
        <li>
          Que la pieza no te quede como esperabas (talla, largo, tono de luz al
          probarla).
        </li>
        <li>
          Daños por uso, golpes, contacto con agua, perfume, cloro o productos
          químicos.
        </li>
        <li>
          Cambio de preferencia, o que la pieza haya sido un regalo y se quiera
          devolver.
        </li>
        <li>
          Desgaste natural del baño con el tiempo (consulta las recomendaciones
          en <a href="/cuidado-de-joyas">el uso de joyas</a>).
        </li>
      </ul>

      <h2>Plazo para reportar</h2>
      <p>
        Tienes <strong>5 días calendario</strong> desde la entrega del pedido
        para reportarnos el defecto. Pasado ese plazo nos cuesta gestionar la
        reclamación.
      </p>

      <h2>Proceso</h2>
      <ol>
        <li>
          Escríbenos por <a href="/contacto">contacto</a> o WhatsApp dentro de
          los 5 días, indica tu número de pedido y describe el defecto.
        </li>
        <li>
          Adjunta <strong>fotos claras</strong> de la pieza donde se vea el
          defecto y el empaque original.
        </li>
        <li>
          Revisamos el caso (1 a 2 días hábiles). Si procede, te enviamos la
          guía prepagada para que envíes la pieza de vuelta.
        </li>
        <li>
          Cuando recibimos la pieza y confirmamos el defecto (3 a 5 días
          hábiles), te enviamos una pieza nueva idéntica sin costo. Si la
          referencia ya no está disponible, puedes escoger otra pieza del mismo
          valor entre las opciones disponibles; si prefieres, también podemos
          reembolsar al medio de pago original.
        </li>
      </ol>

      <h2>Importante</h2>
      <ul>
        <li>
          Los{" "}
          <strong>cambios solo aplican cuando hay defecto de fábrica</strong>.
          En ese caso reemplazamos por la misma referencia y, si ya no está
          disponible, puedes escoger otra pieza del mismo valor entre las
          opciones que tengamos. Por ahora no hacemos cambios por talla, modelo
          o preferencia.
        </li>
        <li>
          La pieza debe regresar en su <strong>empaque original</strong> y con
          todas las etiquetas. Sin empaque no procede la devolución.
        </li>
        <li>
          Piezas <strong>personalizadas</strong> o hechas a la medida no admiten
          devolución salvo defecto evidente de fábrica.
        </li>
      </ul>
    </StaticPageShell>
  );
}
