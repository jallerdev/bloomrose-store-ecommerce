import Link from "next/link";
import { Mail, MessageCircle, Instagram, MapPin, Clock } from "lucide-react";

import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata = {
  title: "Contacto",
  description:
    "Estamos para ayudarte. Escríbenos por correo, WhatsApp o Instagram.",
  alternates: { canonical: "/contacto" },
};

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@bloomroseaccesorios.com";

export default function ContactoPage() {
  return (
    <StaticPageShell
      eyebrow="Estamos para ti"
      title="Contacto"
      subtitle="¿Una duda sobre tu pedido o un material? Te respondemos pronto."
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Contacto" },
      ]}
    >
      <p>
        El canal más rápido es WhatsApp. También puedes escribirnos por correo
        o seguirnos en Instagram para ver lanzamientos antes que nadie.
      </p>

      <div className="not-prose mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {WHATSAPP && (
          <ContactCard
            icon={<MessageCircle className="h-5 w-5 text-primary" />}
            title="WhatsApp"
            description="Lunes a sábado, 9am a 6pm"
            actionLabel="Escribir por WhatsApp"
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              "Hola Bloomrose, tengo una consulta",
            )}`}
            external
          />
        )}
        <ContactCard
          icon={<Mail className="h-5 w-5 text-primary" />}
          title="Correo"
          description="Respondemos en menos de 24 horas hábiles"
          actionLabel={EMAIL}
          href={`mailto:${EMAIL}`}
        />
        <ContactCard
          icon={<Instagram className="h-5 w-5 text-primary" />}
          title="Instagram"
          description="@bloomrose.store"
          actionLabel="Ver en Instagram"
          href="https://instagram.com/bloomrose.store"
          external
        />
        <ContactCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          title="Horario de atención"
          description="Lunes a sábado, 9am a 6pm (hora de Colombia)"
        />
      </div>

      <h2 className="mt-12">Preguntas frecuentes</h2>
      <p>Antes de escribirnos, mira si tu duda ya está cubierta:</p>
      <ul>
        <li>
          <Link href="/envios">Política de envíos</Link>
        </li>
        <li>
          <Link href="/devoluciones">Cambios y devoluciones</Link>
        </li>
        <li>
          <Link href="/cuidado-de-joyas">Cómo cuidar tus piezas</Link>
        </li>
        <li>
          <Link href="/perfil/pedidos">Estado de mi pedido</Link>
        </li>
      </ul>

      <h2 className="not-prose mt-12 flex items-center gap-2 font-serif text-xl text-foreground sm:text-2xl">
        <MapPin className="h-5 w-5 text-primary" />
        Ubicación
      </h2>
      <p>
        Bloomrose Accesorios opera 100% online desde Colombia. No tenemos
        tienda física por ahora, pero todos nuestros pedidos se preparan en
        Bogotá.
      </p>
    </StaticPageShell>
  );
}

function ContactCard({
  icon,
  title,
  description,
  actionLabel,
  href,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {actionLabel && (
          <p className="mt-2 text-sm font-medium text-primary">{actionLabel}</p>
        )}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        {inner}
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
      >
        {inner}
      </a>
    );
  }

  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      {inner}
    </a>
  );
}
