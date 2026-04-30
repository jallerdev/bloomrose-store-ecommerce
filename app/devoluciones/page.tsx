import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Cambios y devoluciones",
  description:
    "Política de cambios y devoluciones de Bloomrose Accesorios. 30 días para que estés segura de tu compra.",
  alternates: { canonical: "/devoluciones" },
};

export default function DevolucionesPage() {
  return (
    <StaticPageShell
      eyebrow="Información"
      title="Cambios y devoluciones"
      subtitle="30 días para que estés 100% segura de tu compra."
      lastUpdated="Abril 2026"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Devoluciones" },
      ]}
    >
      <h2>Política general</h2>
      <p>
        Tienes hasta <strong>30 días calendario</strong> desde la entrega del
        pedido para solicitar un cambio o devolución, siempre que la pieza
        cumpla las condiciones que listamos abajo.
      </p>

      <h2>Condiciones</h2>
      <ul>
        <li>La pieza debe estar <strong>sin uso</strong>.</li>
        <li>
          Debe conservar su <strong>empaque original</strong> y todas las
          etiquetas.
        </li>
        <li>
          No deben presentarse rayones, golpes ni alteraciones imputables al
          cliente.
        </li>
        <li>
          Aplica para cualquier pieza, salvo las exclusiones que listamos a
          continuación.
        </li>
      </ul>

      <h2>Exclusiones</h2>
      <ul>
        <li>
          <strong>Aretes:</strong> por razones de higiene no aceptamos cambios
          ni devoluciones de aretes que se hayan retirado de su empaque
          sellado.
        </li>
        <li>Piezas en <strong>oferta final</strong> (marcadas explícitamente).</li>
        <li>
          Piezas <strong>personalizadas</strong> o hechas a la medida del
          cliente.
        </li>
      </ul>

      <h2>Proceso</h2>
      <ol>
        <li>
          Escríbenos por <a href="/contacto">contacto</a> o WhatsApp dentro de
          los 30 días, con tu número de pedido y motivo.
        </li>
        <li>
          Te confirmamos por correo y te damos la dirección de devolución y la
          guía prepagada (cuando aplique).
        </li>
        <li>
          Empaca la pieza en su empaque original, incluye una nota con tu
          número de pedido y entrégala en cualquier punto Coordinadora.
        </li>
        <li>
          Una vez recibida y revisada (3 a 5 días hábiles), te confirmamos el
          cambio o reembolso.
        </li>
      </ol>

      <h2>Tipos de resolución</h2>
      <ul>
        <li>
          <strong>Cambio por otra pieza</strong> del mismo valor (o pagas la
          diferencia si el nuevo producto vale más).
        </li>
        <li>
          <strong>Reembolso</strong> al medio de pago original (1 a 5 días
          hábiles dependiendo del banco).
        </li>
        <li>
          <strong>Crédito en tienda</strong> con vigencia de 6 meses.
        </li>
      </ul>

      <h2>Garantía de fábrica</h2>
      <p>
        Adicionalmente, todas nuestras piezas tienen <strong>6 meses de
        garantía</strong> contra defectos de fábrica. Si la pieza se daña por un
        defecto del material o del armado, te la cambiamos sin costo.
      </p>
    </StaticPageShell>
  );
}
