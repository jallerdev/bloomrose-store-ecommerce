"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { updatePasswordAction } from "@/app/auth/actions";

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const password = watch("password");

  function onSubmit(values: ResetPasswordInput) {
    const fd = new FormData();
    fd.set("password", values.password);
    fd.set("confirmPassword", values.confirmPassword);
    startTransition(async () => {
      const r = await updatePasswordAction(fd);
      if ("error" in r && r.error) {
        toast.error(r.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/perfil"), 1500);
    });
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="font-serif text-2xl text-foreground">
          Contraseña actualizada
        </h1>
        <p className="text-sm text-muted-foreground">
          Te llevamos a tu cuenta en un momento...
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-2xl text-foreground">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Elige una contraseña segura. Te recomendamos mínimo 8 caracteres con
        mayúsculas y números.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">
            Nueva contraseña
          </Label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className="h-10 border-border bg-background px-9 text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
          <PasswordStrength password={password} className="mt-2" />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">
            Confirmar contraseña
          </Label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className="h-10 border-border bg-background px-9 text-sm"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cambiar contraseña
        </Button>

        <Link
          href="/auth/login"
          className="self-center text-xs text-muted-foreground hover:text-foreground"
        >
          Volver al inicio de sesión
        </Link>
      </form>
    </>
  );
}
