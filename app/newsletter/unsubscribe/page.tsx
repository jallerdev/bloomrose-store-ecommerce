import { StaticPageShell } from "@/components/StaticPageShell";
import { verifyToken } from "@/lib/newsletter/token";

import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata = {
  title: "Darse de baja del newsletter",
  description: "Confirma tu baja del newsletter de Bloom Rose Accesorios.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { email: rawEmail, token: rawToken } = await searchParams;
  const email = rawEmail?.toLowerCase().trim() ?? "";
  const token = rawToken ?? "";
  const valid = verifyToken(email, token);

  return (
    <StaticPageShell
      eyebrow="Newsletter"
      title="Darse de baja"
      breadcrumb={[
        { label: "Inicio", href: "/" },
        { label: "Darse de baja" },
      ]}
    >
      {valid ? (
        <UnsubscribeForm email={email} token={token} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-serif text-xl text-foreground">
            Enlace inválido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            El enlace de baja no es válido o ha caducado. Si quieres dejar de
            recibir el newsletter, respóndenos al correo y lo gestionamos
            manualmente.
          </p>
        </div>
      )}
    </StaticPageShell>
  );
}
