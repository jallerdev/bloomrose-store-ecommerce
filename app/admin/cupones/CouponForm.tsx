"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createCouponAction,
  updateCouponAction,
} from "@/app/admin/cupones/actions";

export interface CouponDTO {
  id?: string;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minPurchase: number | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  startsAt: string; // yyyy-mm-dd
  expiresAt: string | null; // yyyy-mm-dd
  isActive: boolean;
  appliesTo: "ALL" | "CATEGORY" | "PRODUCT";
  targetIds: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: CouponDTO;
}

const empty: CouponDTO = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 10,
  minPurchase: null,
  maxUses: null,
  maxUsesPerUser: null,
  startsAt: new Date().toISOString().slice(0, 10),
  expiresAt: null,
  isActive: true,
  appliesTo: "ALL",
  targetIds: [],
};

export function CouponForm({ open, onOpenChange, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CouponDTO>(initial ?? empty);

  // Re-init si cambia el `initial`
  if (initial && initial.code !== form.code && open && !isPending) {
    // no-op para evitar loops; usamos useEffect equivalente
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description.trim() || null,
      startsAt: form.startsAt ? new Date(form.startsAt) : new Date(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
    };

    startTransition(async () => {
      const r = initial?.id
        ? await updateCouponAction({ id: initial.id, ...payload })
        : await createCouponAction(payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(initial?.id ? "Cupón actualizado" : "Cupón creado");
      onOpenChange(false);
      setForm(empty);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {initial?.id ? "Editar cupón" : "Nuevo cupón"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground">Código</Label>
              <Input
                className="mt-1 h-10 font-mono"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
                placeholder="VERANO20"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    type: v as CouponDTO["type"],
                  }))
                }
              >
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">% Porcentaje</SelectItem>
                  <SelectItem value="FIXED">$ Monto fijo</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Envío gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Descripción</Label>
            <Textarea
              rows={2}
              className="mt-1 text-sm"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Visible solo para el admin. Ej: campaña Día de la Madre."
            />
          </div>

          {form.type !== "FREE_SHIPPING" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {form.type === "PERCENTAGE"
                    ? "Porcentaje (%)"
                    : "Monto a descontar (COP)"}
                </Label>
                <Input
                  type="number"
                  className="mt-1 h-10"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      value: Number(e.target.value),
                    }))
                  }
                  min={0}
                  step={form.type === "PERCENTAGE" ? 1 : 1000}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Compra mínima (opcional)
                </Label>
                <Input
                  type="number"
                  className="mt-1 h-10"
                  value={form.minPurchase ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minPurchase:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  min={0}
                  step={1000}
                  placeholder="Ej. 100000"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Tope total de usos (opcional)
              </Label>
              <Input
                type="number"
                className="mt-1 h-10"
                value={form.maxUses ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxUses:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                min={1}
                placeholder="Ilimitado"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Tope por usuario (opcional)
              </Label>
              <Input
                type="number"
                className="mt-1 h-10"
                value={form.maxUsesPerUser ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxUsesPerUser:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                min={1}
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Inicia
              </Label>
              <Input
                type="date"
                className="mt-1 h-10"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startsAt: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Expira (opcional)
              </Label>
              <Input
                type="date"
                className="mt-1 h-10"
                value={form.expiresAt ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    expiresAt: e.target.value || null,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <Checkbox
              id="active"
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, isActive: Boolean(v) }))
              }
            />
            <Label
              htmlFor="active"
              className="cursor-pointer text-sm text-foreground"
            >
              Cupón activo
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial?.id ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
