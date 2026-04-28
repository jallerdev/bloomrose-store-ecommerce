import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  SHIPPED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  DELIVERED: "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border-emerald-600/30",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-xs font-medium",
        STATUS_CLASS[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
