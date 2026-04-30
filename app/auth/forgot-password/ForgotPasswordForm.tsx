"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { requestPasswordResetAction } from "@/app/auth/actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordInput) {
    const fd = new FormData();
    fd.set("email", values.email);
    startTransition(async () => {
      const r = await requestPasswordResetAction(fd);
      if ("error" in r && r.error) {
        toast.error(r.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-serif text-2xl text-foreground">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground">
          Si tenemos una cuenta con ese email, te enviaremos un enlace para
          restablecer tu contraseña en unos minutos.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/auth/login">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Volver al inicio de sesión
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl text-foreground">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ingresa tu email y te enviaremos un enlace para restablecerla.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className="h-10 border-border bg-background pl-9 text-sm"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar enlace
        </Button>

        <Link
          href="/auth/login"
          className="self-center text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 inline h-3 w-3" />
          Volver al inicio de sesión
        </Link>
      </form>
    </>
  );
}
