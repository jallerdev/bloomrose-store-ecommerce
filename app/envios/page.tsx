import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Política de envíos",
  description:
    "Información sobre tiempos, costos y cobertura de envíos de Bloomrose Accesorios en Colombia.",
  alternates: { canonical: "/envios" },
};

export default function EnviosPage() {
  return (
    <StaticPageShell
      eyebrow="Información"
      title="Envíos"
      subtitle="Llevamos tus piezas a toda Colombia."
      lastUpdated="Abril 2026"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Envíos" },
      ]}
    >
      <h2>Cobertura</h2>
      <p>
        Realizamos envíos a todo el territorio nacional a través de{" "}
        <strong>Coordinadora</strong>, una de las transportadoras más confiables
        del país. Cubrimos las principales ciudades y municipios.
      </p>

      <h2>Tiempos de entrega</h2>
      <ul>
        <li>
          <strong>Bogotá y área metropolitana:</strong> 1 a 2 días hábiles.
        </li>
        <li>
          <strong>Ciudades principales</strong> (Medellín, Cali, Barranquilla,
          Cartagena, Bucaramanga): 2 a 3 días hábiles.
        </li>
        <li>
          <strong>Otras ciudades y municipios:</strong> 3 a 5 días hábiles.
        </li>
      </ul>
      <p>
        Los tiempos comienzan a contar desde la confirmación del pago. No
        despachamos pedidos los domingos ni festivos.
      </p>

      <h2>Costos</h2>
      <ul>
        <li>
          <strong>Envío gratis</strong> en pedidos superiores a{" "}
          <strong>$200.000 COP</strong>.
        </li>
        <li>
          Para pedidos por debajo de ese monto, el costo se calcula
          automáticamente según tu ciudad y el peso del paquete.
        </li>
        <li>
          Verás el costo final en la pantalla de checkout antes de pagar.
        </li>
      </ul>

      <h2>Seguimiento</h2>
      <p>
        Una vez tu pedido salga de nuestra bodega, recibirás un correo con el{" "}
        <strong>número de guía</strong> para que puedas rastrearlo en tiempo
        real. También puedes consultar el estado en tu cuenta, en la sección{" "}
        <a href="/perfil/pedidos">Mis pedidos</a>.
      </p>

      <h2>Empaque</h2>
      <p>
        Cada pieza viaja en su bolsita individual y dentro de una caja
        protegida. Las piezas frágiles se acolchan adicionalmente.
      </p>

      <h2>¿No llegó tu pedido?</h2>
      <p>
        Si han pasado más días de los esperados, escríbenos por{" "}
        <a href="/contacto">el formulario de contacto</a> o por WhatsApp y lo
        rastreamos contigo.
      </p>
    </StaticPageShell>
  );
}
