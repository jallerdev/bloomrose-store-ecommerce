"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Power, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/app/admin/cupones/actions";
import { CouponForm, type CouponDTO } from "./CouponForm";

interface CouponRow extends CouponDTO {
  id: string;
  redemptions: number;
}

interface Props {
  coupons: CouponRow[];
}

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const TYPE_LABEL: Record<CouponDTO["type"], string> = {
  PERCENTAGE: "% Porcentaje",
  FIXED: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
};

export function CouponsClient({ coupons }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CouponDTO | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setOpen(true);
  }
  function openEdit(c: CouponRow) {
    setEditing(c);
    setOpen(true);
  }
  function handleDelete(id: string, code: string) {
    if (
      !window.confirm(
        `¿Eliminar el cupón "${code}"? También se eliminan sus redenciones registradas.`,
      )
    )
      return;
    startTransition(async () => {
      const r = await deleteCouponAction(id);
      if (!r.ok) toast.error(r.error);
      else toast.success("Cupón eliminado");
      router.refresh();
    });
  }
  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const r = await toggleCouponActiveAction({ couponId: id, isActive });
      if (!r.ok) toast.error(r.error);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {coupons.length} cupón{coupons.length === 1 ? "" : "es"} configurado
          {coupons.length === 1 ? "" : "s"}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo cupón
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Tag className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aún no tienes cupones. Crea el primero para lanzar una campaña.
          </p>
          <Button onClick={openCreate}>Crear primer cupón</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <Th>Código</Th>
                <Th className="hidden sm:table-cell">Tipo</Th>
                <Th className="hidden md:table-cell">Valor</Th>
                <Th className="text-center">Usos</Th>
                <Th className="hidden lg:table-cell">Vigencia</Th>
                <Th className="text-center">Activo</Th>
                <Th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => {
                const valueLabel =
                  c.type === "FREE_SHIPPING"
                    ? "—"
                    : c.type === "PERCENTAGE"
                      ? `${c.value}%`
                      : fmtCOP(c.value);
                const usageLabel = c.maxUses
                  ? `${c.redemptions} / ${c.maxUses}`
                  : `${c.redemptions}`;
                const expiresLabel = c.expiresAt
                  ? new Date(c.expiresAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Sin vencimiento";

                return (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {c.code}
                      </p>
                      {c.description && (
                        <p className="line-clamp-1 text-[11px] text-muted-foreground">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <Badge variant="outline" className="font-normal">
                        {TYPE_LABEL[c.type]}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-foreground">{valueLabel}</span>
                      {c.minPurchase ? (
                        <p className="text-[11px] text-muted-foreground">
                          Mín {fmtCOP(c.minPurchase)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center text-xs tabular-nums text-muted-foreground">
                      {usageLabel}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {expiresLabel}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={c.isActive}
                        onCheckedChange={(v) =>
                          handleToggle(c.id, Boolean(v))
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CouponForm open={open} onOpenChange={setOpen} initial={editing} />
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}
