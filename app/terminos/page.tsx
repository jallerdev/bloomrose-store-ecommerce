import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso del sitio y compras en Bloom Rose Accesorios.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Términos y condiciones"
      lastUpdated="Abril 2026"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Términos y condiciones" },
      ]}
    >
      <p>
        Bienvenida a Bloom Rose Accesorios. Al navegar este sitio o realizar una
        compra aceptas los presentes términos. Te pedimos leerlos con atención.
      </p>

      <h2>1. Sobre Bloom Rose</h2>
      <p>
        Bloom Rose Accesorios es una marca colombiana de bisutería artesanal que
        opera a través del sitio{" "}
        <strong>https://bloomroseaccesorios.com</strong>. Las compras se rigen
        por la legislación colombiana, en particular la Ley 1480 de 2011
        (Estatuto del Consumidor).
      </p>

      <h2>2. Cuenta y registro</h2>
      <ul>
        <li>
          Puedes comprar como invitada o crear una cuenta para acceder a tu
          historial de pedidos, direcciones guardadas y favoritos.
        </li>
        <li>
          Eres responsable de mantener tus credenciales seguras. Avísanos si
          sospechas un acceso no autorizado.
        </li>
        <li>
          Puedes solicitar la eliminación de tu cuenta escribiéndonos al
          correo de contacto.
        </li>
      </ul>

      <h2>3. Productos, precios y disponibilidad</h2>
      <ul>
        <li>
          Todos los precios están en pesos colombianos (COP) e incluyen IVA
          cuando aplica.
        </li>
        <li>
          Las imágenes son representativas. Pequeñas variaciones de color o
          tono pueden ocurrir por la luz al fotografiar.
        </li>
        <li>
          Nos reservamos el derecho a modificar precios y catálogo sin previo
          aviso. El precio aplicable es el vigente al momento de generar el
          pedido.
        </li>
        <li>
          La disponibilidad se actualiza en tiempo real. Si una pieza queda
          agotada justo después de tu compra, te contactaremos para resolver
          (cambio, crédito o reembolso).
        </li>
      </ul>

      <h2>4. Pago</h2>
      <p>
        Procesamos los pagos a través de <strong>Wompi</strong>, una pasarela
        certificada PCI DSS. Aceptamos tarjetas de crédito y débito, PSE,
        Nequi y Bancolombia. Bloom Rose no almacena datos de tu tarjeta.
      </p>

      <h2>5. Envíos</h2>
      <p>
        Los detalles completos están en nuestra{" "}
        <a href="/envios">política de envíos</a>. Envío gratis sobre $200.000;
        tiempos de entrega entre 1 y 5 días hábiles según ciudad.
      </p>

      <h2>6. Cambios y devoluciones</h2>
      <p>
        Tienes 30 días desde la entrega para cambios y devoluciones bajo las
        condiciones detalladas en{" "}
        <a href="/devoluciones">cambios y devoluciones</a>.
      </p>

      <h2>7. Derecho de retracto</h2>
      <p>
        En cumplimiento del artículo 47 de la Ley 1480 de 2011, tienes derecho
        a retractarte dentro de los 5 días hábiles siguientes a la entrega del
        producto, sin necesidad de justificar tu decisión, siempre que el
        producto no haya sido usado y se encuentre en su empaque original.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        Todo el contenido del sitio (textos, imágenes, logo, diseños) es
        propiedad de Bloom Rose Accesorios y está protegido por las leyes de
        propiedad intelectual. No está permitido reproducirlo sin autorización.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        Bloom Rose responde por la calidad e idoneidad de las piezas vendidas en
        los términos previstos por la ley. No asumimos responsabilidad por usos
        inadecuados, alteraciones hechas por terceros o daños imputables al
        comprador.
      </p>

      <h2>10. Comunicaciones</h2>
      <p>
        Al darnos tu correo electrónico podemos enviarte confirmación de
        pedido, actualizaciones de envío y, si lo aceptaste, novedades de la
        marca. Puedes darte de baja en cualquier momento.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier inquietud relacionada con estos términos, escríbenos
        desde la página de <a href="/contacto">contacto</a>.
      </p>

      <p className="mt-8 text-xs">
        <em>
          Este texto es una referencia general. Para situaciones legales
          específicas se aplica la legislación vigente en Colombia.
        </em>
      </p>
    </StaticPageShell>
  );
}
