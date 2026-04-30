"use client";

import { useTransition, useState } from "react";
import { loginAction, signupAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AuthForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (formData: FormData) => {
    setErrorMsg(null);
    formData.append("returnTo", returnTo);
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success("¡Bienvenido/a a Bloomrose!");
      }
    });
  };

  const handleRegister = (formData: FormData) => {
    setErrorMsg(null);
    formData.append("returnTo", returnTo);
    startTransition(async () => {
      const res = await signupAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success("¡Cuenta creada exitosamente!");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-serif text-primary">Bloomrose</h1>
        <p className="text-sm text-muted-foreground">
          Únete a nuestra exclusiva colección
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form
            action={handleLogin}
            className="space-y-4 rounded-xl border bg-card p-6 shadow-sm mt-4"
          >
            {errorMsg && (
              <p className="text-sm text-destructive text-center mb-4">
                {errorMsg}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email-login">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-login"
                  name="email"
                  type="email"
                  placeholder="hola@ejemplo.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-login">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password-login"
                  name="password"
                  type="password"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form
            action={handleRegister}
            className="space-y-4 rounded-xl border bg-card p-6 shadow-sm mt-4"
          >
            {errorMsg && (
              <p className="text-sm text-destructive text-center mb-4">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-register">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-register"
                  name="email"
                  type="email"
                  placeholder="hola@ejemplo.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-register">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password-register"
                  name="password"
                  type="password"
                  required
                  className="pl-10"
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
