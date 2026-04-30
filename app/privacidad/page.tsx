import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Bloomrose Accesorios protege y trata los datos personales de sus clientas.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Política de privacidad"
      lastUpdated="Abril 2026"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Privacidad" },
      ]}
    >
      <p>
        En Bloomrose Accesorios cuidamos los datos de nuestras clientas con la
        misma atención con la que armamos cada pieza. Esta política explica
        qué información recolectamos, para qué la usamos y cuáles son tus
        derechos como titular de datos.
      </p>

      <h2>1. Marco legal</h2>
      <p>
        Cumplimos la <strong>Ley 1581 de 2012</strong> de Protección de Datos
        Personales en Colombia y su Decreto reglamentario 1377 de 2013.
      </p>

      <h2>2. Responsable del tratamiento</h2>
      <p>
        <strong>Bloomrose Accesorios.</strong> Para temas de protección de
        datos puedes escribirnos desde nuestra página de{" "}
        <a href="/contacto">contacto</a>.
      </p>

      <h2>3. Qué datos recolectamos</h2>
      <ul>
        <li>
          <strong>Datos de cuenta:</strong> nombre, apellido, correo
          electrónico, teléfono.
        </li>
        <li>
          <strong>Dirección de envío:</strong> dirección, ciudad, departamento.
        </li>
        <li>
          <strong>Datos de pedido:</strong> productos comprados, montos, fecha.
        </li>
        <li>
          <strong>Datos técnicos:</strong> IP, navegador, dispositivo, páginas
          visitadas (analítica anónima).
        </li>
        <li>
          <strong>Datos de pago:</strong> los procesa directamente Wompi.
          Nosotros no almacenamos tu tarjeta.
        </li>
      </ul>

      <h2>4. Para qué los usamos</h2>
      <ul>
        <li>Procesar tu pedido y enviarte tracking.</li>
        <li>Atender tus consultas y devoluciones.</li>
        <li>
          Mejorar la experiencia del sitio (analítica anónima).
        </li>
        <li>
          Enviarte comunicaciones de marca <strong>solo si las aceptaste</strong>{" "}
          (boletín, lanzamientos).
        </li>
        <li>Cumplir obligaciones legales (facturación, garantías).</li>
      </ul>

      <h2>5. Con quién compartimos datos</h2>
      <p>
        Compartimos información estrictamente necesaria con proveedores que
        nos ayudan a operar:
      </p>
      <ul>
        <li>
          <strong>Wompi</strong> — pasarela de pago (certificada PCI DSS).
        </li>
        <li>
          <strong>Coordinadora</strong> — para el envío de tu pedido.
        </li>
        <li>
          <strong>Resend</strong> — para enviar correos transaccionales.
        </li>
        <li>
          <strong>Supabase</strong> — para alojar la base de datos del sitio.
        </li>
      </ul>
      <p>
        No vendemos ni alquilamos tus datos a terceros. No los compartimos con
        fines de marketing externo.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Usamos cookies técnicas para que el carrito y la sesión funcionen, y
        cookies analíticas anónimas para entender el uso del sitio. Puedes
        configurar tu navegador para bloquearlas, aunque algunas funciones
        podrían dejar de funcionar.
      </p>

      <h2>7. Tiempo de conservación</h2>
      <ul>
        <li>
          <strong>Cuenta y pedidos:</strong> mientras la cuenta esté activa,
          más el tiempo legalmente exigido (mínimo 5 años por temas
          contables).
        </li>
        <li>
          <strong>Datos para envíos puntuales (guest checkout):</strong> el
          tiempo necesario para entregar y atender devoluciones.
        </li>
      </ul>

      <h2>8. Tus derechos</h2>
      <ul>
        <li>Conocer qué datos tenemos sobre ti.</li>
        <li>Rectificar datos inexactos.</li>
        <li>Solicitar la eliminación de tu cuenta.</li>
        <li>Revocar autorizaciones previas (boletín, comunicaciones).</li>
      </ul>
      <p>
        Para ejercerlos escríbenos desde <a href="/contacto">contacto</a>{" "}
        indicando claramente la solicitud. Te respondemos en máximo 15 días
        hábiles.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        Aplicamos buenas prácticas de seguridad: contraseñas hash, conexión
        HTTPS, accesos por roles, separación de datos sensibles. Aún así,
        ningún sistema es 100% inviolable. Si detectamos una brecha que
        afecte tus datos, te avisaremos sin demora.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Si actualizamos esta política, notificaremos los cambios en el sitio y
        actualizaremos la fecha de "Última actualización".
      </p>
    </StaticPageShell>
  );
}
