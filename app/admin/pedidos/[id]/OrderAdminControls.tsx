"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Truck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  generateCoordinadoraGuideAction,
  setTrackingNumberAction,
  updateOrderStatusAction,
} from "../actions";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

interface Props {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
  shippingCarrier: string;
}

export function OrderAdminControls({
  orderId,
  currentStatus,
  currentTracking,
  shippingCarrier,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");

  function changeStatus(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      const r = await updateOrderStatusAction({ orderId, status: newStatus });
      if (!r.ok) {
        toast.error(r.error);
        setStatus(currentStatus);
        return;
      }
      toast.success("Estado actualizado");
      router.refresh();
    });
  }

  function saveTracking() {
    if (!tracking.trim()) {
      toast.error("Ingresa un número de guía");
      return;
    }
    startTransition(async () => {
      const r = await setTrackingNumberAction({
        orderId,
        trackingNumber: tracking.trim(),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Tracking guardado · pedido marcado como enviado");
      router.refresh();
    });
  }

  function generateGuide() {
    startTransition(async () => {
      const r = await generateCoordinadoraGuideAction({ orderId });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Guía generada: ${r.trackingNumber}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg text-foreground">Acciones</h2>

      <div>
        <Label className="text-xs text-muted-foreground">Estado</Label>
        <Select
          value={status}
          onValueChange={changeStatus}
          disabled={isPending}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground">
          Número de guía ({shippingCarrier})
        </Label>
        <Input
          className="mt-1"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Ingresar manualmente o generar"
          disabled={isPending}
        />
        <div className="mt-2 flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            onClick={saveTracking}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Guardar tracking manual
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={generateGuide}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Truck className="mr-2 h-4 w-4" />
            )}
            Generar guía Coordinadora
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Marcar &quot;Enviado&quot; envía email de tracking al cliente.
        </p>
      </div>

      <Separator />

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => router.refresh()}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Recargar
      </Button>
    </div>
  );
}
