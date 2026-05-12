"use client";

import { useState, useTransition } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { subscribeToStockAction } from "@/app/productos/stock-actions";

interface Props {
  productId: string;
  defaultEmail?: string;
  className?: string;
}

export function NotifyWhenInStock({
  productId,
  defaultEmail,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      toast.error("Ingresa tu email");
      return;
    }
    startTransition(async () => {
      const res = await subscribeToStockAction({ productId, email: value });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.alreadySubscribed) {
        toast.success("Ya estás en la lista. Te avisaremos cuando llegue.");
      } else {
        toast.success("Listo. Te avisaremos por correo cuando esté disponible.");
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={className}
        >
          <Bell className="mr-2 h-4 w-4" />
          Avísame cuando llegue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avísame cuando llegue</DialogTitle>
          <DialogDescription>
            Te enviaremos un correo en cuanto este producto vuelva a estar
            disponible. Solo un aviso, sin spam.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suscribirme
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
