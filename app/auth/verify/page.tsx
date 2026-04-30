import Link from "next/link";
import { MailCheck } from "lucide-react";

import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verifica tu correo" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <StoreHeader />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">
            Revisa tu correo
          </h1>
          <p className="text-sm text-muted-foreground">
            Te enviamos un enlace de verificación
            {email ? (
              <>
                {" "}
                a <strong className="text-foreground">{email}</strong>
              </>
            ) : null}
            . Haz click en el enlace para activar tu cuenta y empezar a comprar.
          </p>
          <p className="text-xs text-muted-foreground">
            Si no lo ves en unos minutos, revisa tu carpeta de spam.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/auth/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
