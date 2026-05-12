"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { loginAction, signupAction } from "@/app/auth/actions";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validation/auth";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export function AuthForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const initialError = searchParams.get("error");

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-brand text-5xl text-primary">Bloom Rose</h1>
        <p className="text-sm text-muted-foreground">
          Únete a nuestra exclusiva colección
        </p>
      </div>

      {initialError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center text-xs text-destructive">
          {initialError}
        </div>
      )}

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="register">Crear cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm returnTo={returnTo} />
        </TabsContent>

        <TabsContent value="register">
          <SignupForm returnTo={returnTo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────

function LoginForm({ returnTo }: { returnTo: string }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    const fd = new FormData();
    fd.set("email", values.email);
    fd.set("password", values.password);
    fd.set("returnTo", returnTo);
    startTransition(async () => {
      const res = await loginAction(fd);
      if (res?.error) toast.error(res.error);
      else toast.success("¡Bienvenida a Bloom Rose!");
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 space-y-4 rounded-xl border bg-card p-6 shadow-sm"
    >
      <OAuthButtons returnTo={returnTo} />
      <div className="space-y-2">
        <Label htmlFor="email-login">Correo electrónico</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email-login"
            type="email"
            autoComplete="email"
            placeholder="hola@ejemplo.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password-login">Contraseña</Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password-login"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="px-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Iniciar sesión
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────
// Signup
// ─────────────────────────────────────────────────────────────────

function SignupForm({ returnTo }: { returnTo: string }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined as unknown as true,
    },
    mode: "onBlur",
  });

  const password = watch("password");
  const acceptTerms = watch("acceptTerms");

  function onSubmit(values: SignupInput) {
    const fd = new FormData();
    fd.set("firstName", values.firstName);
    fd.set("lastName", values.lastName);
    fd.set("email", values.email);
    fd.set("password", values.password);
    fd.set("confirmPassword", values.confirmPassword);
    fd.set("acceptTerms", values.acceptTerms ? "on" : "");
    fd.set("returnTo", returnTo);
    startTransition(async () => {
      const res = await signupAction(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else toast.success("¡Cuenta creada! Revisa tu correo.");
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 space-y-4 rounded-xl border bg-card p-6 shadow-sm"
    >
      <OAuthButtons returnTo={returnTo} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="firstName"
              autoComplete="given-name"
              className="pl-10"
              {...register("firstName")}
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <div className="relative">
            <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lastName"
              autoComplete="family-name"
              className="pl-10"
              {...register("lastName")}
            />
          </div>
          {errors.lastName && (
            <p className="text-xs text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-register">Correo electrónico</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email-register"
            type="email"
            autoComplete="email"
            placeholder="hola@ejemplo.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-register">Contraseña</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password-register"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="px-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
        <PasswordStrength password={password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            className="px-10"
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
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="acceptTerms"
          checked={Boolean(acceptTerms)}
          onCheckedChange={(v) =>
            setValue("acceptTerms", v === true ? true : (false as unknown as true), {
              shouldValidate: true,
            })
          }
        />
        <Label
          htmlFor="acceptTerms"
          className="cursor-pointer text-xs leading-relaxed text-muted-foreground"
        >
          Acepto los{" "}
          <Link
            href="/terminos"
            className="text-primary underline-offset-4 hover:underline"
          >
            términos
          </Link>{" "}
          y la{" "}
          <Link
            href="/privacidad"
            className="text-primary underline-offset-4 hover:underline"
          >
            política de privacidad
          </Link>
          .
        </Label>
      </div>
      {errors.acceptTerms && (
        <p className="-mt-2 text-xs text-destructive">
          {errors.acceptTerms.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  );
}
