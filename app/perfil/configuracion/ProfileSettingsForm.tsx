"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  userId: string;
  defaultValues: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export function ProfileSettingsForm({
  userId,
  defaultValues,
}: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(defaultValues);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
        })
        .eq("id", userId);

      if (error) {
        toast.error("Error al guardar los cambios.");
      } else {
        toast.success("¡Perfil actualizado!");
        router.refresh();
      }
    });
  }

  const inputClass = "h-10 border-border bg-background text-sm";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-muted-foreground">Nombre</Label>
          <Input
            className={inputClass + " mt-1"}
            value={form.firstName}
            onChange={(e) =>
              setForm((f) => ({ ...f, firstName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Apellido</Label>
          <Input
            className={inputClass + " mt-1"}
            value={form.lastName}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastName: e.target.value }))
            }
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Teléfono</Label>
        <Input
          className={inputClass + " mt-1"}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:self-end"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar cambios"
        )}
      </Button>
    </form>
  );
}
