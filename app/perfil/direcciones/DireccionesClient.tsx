"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "./actions";

interface AddressDTO {
  id: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  isDefault: boolean;
}

interface Props {
  addresses: AddressDTO[];
}

const empty = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

export function DireccionesClient({ addresses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });

  function openCreate() {
    setEditingId(null);
    setForm({ ...empty, isDefault: addresses.length === 0 });
    setOpen(true);
  }

  function openEdit(a: AddressDTO) {
    setEditingId(a.id);
    setForm({
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? "",
      city: a.city,
      state: a.state,
      postalCode: a.postalCode ?? "",
      isDefault: a.isDefault,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim() || null,
      isDefault: form.isDefault,
    };

    startTransition(async () => {
      const r = editingId
        ? await updateAddressAction({ id: editingId, ...payload })
        : await addAddressAction(payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(editingId ? "Dirección actualizada" : "Dirección agregada");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    startTransition(async () => {
      const r = await deleteAddressAction(id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Dirección eliminada");
      router.refresh();
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      const r = await setDefaultAddressAction(id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Dirección predeterminada");
      router.refresh();
    });
  }

  const inputClass = "h-10 border-border bg-background text-sm";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {addresses.length} dirección{addresses.length === 1 ? "" : "es"} guardada
          {addresses.length === 1 ? "" : "s"}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aún no tienes direcciones guardadas.
          </p>
          <Button onClick={openCreate}>Agregar la primera</Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-card p-5",
                a.isDefault ? "border-primary/40" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {a.addressLine1}
                    {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {a.city}, {a.state}
                    {a.postalCode ? ` · ${a.postalCode}` : ""}
                  </p>
                </div>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <Star className="h-3 w-3 fill-primary" />
                    Predeterminada
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                {!a.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(a.id)}
                    disabled={isPending}
                    className="text-xs"
                  >
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Marcar como predeterminada
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(a)}
                  disabled={isPending}
                  className="text-xs"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(a.id)}
                  disabled={isPending}
                  className="ml-auto text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de creación/edición */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingId ? "Editar dirección" : "Nueva dirección"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Dirección</Label>
              <Input
                className={inputClass + " mt-1"}
                value={form.addressLine1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressLine1: e.target.value }))
                }
                required
                placeholder="Calle 123 # 45-67"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Apto / Torre / Referencia (opcional)
              </Label>
              <Input
                className={inputClass + " mt-1"}
                value={form.addressLine2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, addressLine2: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Ciudad</Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Departamento
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Código postal (opcional)
              </Label>
              <Input
                className={inputClass + " mt-1"}
                value={form.postalCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postalCode: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="default"
                checked={form.isDefault}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, isDefault: Boolean(v) }))
                }
              />
              <Label
                htmlFor="default"
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Usar como dirección predeterminada
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Guardar cambios" : "Agregar dirección"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
