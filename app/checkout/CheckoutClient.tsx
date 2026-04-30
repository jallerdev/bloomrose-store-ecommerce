"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShoppingBag } from "lucide-react";

import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { createPendingOrderAction } from "./actions";
import { estimateShippingCost } from "@/lib/shipping";

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
  /** True cuando no hay sesión (compra como invitado). */
  isGuest: boolean;
  addresses: AddressDTO[];
  defaultContact: { fullName: string; phone: string; email: string };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function CheckoutClient({ isGuest, addresses, defaultContact }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { items, getTotalPrice, clearCart } = useCartStore();
  useEffect(() => setMounted(true), []);

  const hasSavedAddresses = addresses.length > 0;
  const defaultAddressId =
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "";

  const [addressMode, setAddressMode] = useState<"existing" | "new">(
    hasSavedAddresses ? "existing" : "new",
  );
  const [existingAddressId, setExistingAddressId] = useState(defaultAddressId);

  const [contactFullName, setContactFullName] = useState(
    defaultContact.fullName,
  );
  const [contactPhone, setContactPhone] = useState(defaultContact.phone);
  const [contactEmail, setContactEmail] = useState(defaultContact.email);

  const [newAddr, setNewAddr] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    // Solo aplica para usuarios autenticados; los guests no pueden guardar dirección.
    saveForLater: !isGuest,
  });
  const [notes, setNotes] = useState("");

  const subtotal = mounted ? getTotalPrice() : 0;

  const cityForShipping = useMemo(() => {
    if (addressMode === "new") return newAddr.city;
    return addresses.find((a) => a.id === existingAddressId)?.city ?? "";
  }, [addressMode, newAddr.city, existingAddressId, addresses]);

  const shippingCost = cityForShipping
    ? estimateShippingCost({ city: cityForShipping, subtotal })
    : 0;
  const total = subtotal + shippingCost;

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border bg-card py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-serif text-xl text-foreground">
            Tu carrito está vacío
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Agrega productos antes de finalizar la compra.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos">Explorar catálogo</Link>
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isGuest && !contactEmail.trim()) {
      toast.error("Ingresa tu email para enviarte la confirmación");
      return;
    }

    startTransition(async () => {
      const result = await createPendingOrderAction({
        items: items.map((i) => ({ variantId: i.id, quantity: i.quantity })),
        addressMode,
        existingAddressId:
          addressMode === "existing" ? existingAddressId : undefined,
        newAddress:
          addressMode === "new"
            ? {
                fullName: contactFullName,
                phone: contactPhone,
                addressLine1: newAddr.addressLine1,
                addressLine2: newAddr.addressLine2 || null,
                city: newAddr.city,
                state: newAddr.state,
                postalCode: newAddr.postalCode || null,
                saveForLater: newAddr.saveForLater,
              }
            : undefined,
        contactFullName,
        contactPhone,
        contactEmail: contactEmail.trim() || undefined,
        notes: notes || null,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      // Stock fue reservado en el server. Limpiamos carrito y redirigimos.
      // (En task #3 redirigiremos a Wompi en su lugar.)
      clearCart();
      toast.success("Pedido creado. Redirigiendo al pago...");
      router.push(`/checkout/pago/${result.orderId}`);
    });
  }

  const inputClass = "h-10 border-border bg-background text-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]"
    >
      {/* Columna izquierda: formulario */}
      <div className="flex flex-col gap-8">
        {/* Contacto */}
        <section>
          <h2 className="mb-4 font-serif text-xl text-foreground">Contacto</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isGuest && (
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Te enviaremos la confirmación y el seguimiento del pedido a
                  este correo.
                </p>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">
                Nombre completo
              </Label>
              <Input
                className={inputClass + " mt-1"}
                value={contactFullName}
                onChange={(e) => setContactFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Teléfono</Label>
              <Input
                className={inputClass + " mt-1"}
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Dirección */}
        <section>
          <h2 className="mb-4 font-serif text-xl text-foreground">
            Dirección de envío
          </h2>

          {hasSavedAddresses && (
            <RadioGroup
              value={addressMode}
              onValueChange={(v) => setAddressMode(v as "existing" | "new")}
              className="mb-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="addr-existing" />
                <Label htmlFor="addr-existing" className="cursor-pointer">
                  Usar dirección guardada
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="addr-new" />
                <Label htmlFor="addr-new" className="cursor-pointer">
                  Usar nueva dirección
                </Label>
              </div>
            </RadioGroup>
          )}

          {addressMode === "existing" && hasSavedAddresses ? (
            <RadioGroup
              value={existingAddressId}
              onValueChange={setExistingAddressId}
              className="flex flex-col gap-3"
            >
              {addresses.map((a) => (
                <label
                  key={a.id}
                  htmlFor={`addr-${a.id}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50"
                >
                  <RadioGroupItem
                    value={a.id}
                    id={`addr-${a.id}`}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {a.addressLine1}
                      {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {a.city}, {a.state}
                      {a.postalCode ? ` · ${a.postalCode}` : ""}
                    </p>
                    {a.isDefault && (
                      <p className="mt-1 text-xs text-primary">Predeterminada</p>
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Dirección
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  placeholder="Calle 123 # 45-67"
                  value={newAddr.addressLine1}
                  onChange={(e) =>
                    setNewAddr((a) => ({ ...a, addressLine1: e.target.value }))
                  }
                  required={addressMode === "new"}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Apto / Torre / Referencia (opcional)
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={newAddr.addressLine2}
                  onChange={(e) =>
                    setNewAddr((a) => ({ ...a, addressLine2: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ciudad</Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={newAddr.city}
                  onChange={(e) =>
                    setNewAddr((a) => ({ ...a, city: e.target.value }))
                  }
                  required={addressMode === "new"}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Departamento
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={newAddr.state}
                  onChange={(e) =>
                    setNewAddr((a) => ({ ...a, state: e.target.value }))
                  }
                  required={addressMode === "new"}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Código postal (opcional)
                </Label>
                <Input
                  className={inputClass + " mt-1"}
                  value={newAddr.postalCode}
                  onChange={(e) =>
                    setNewAddr((a) => ({ ...a, postalCode: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="save-addr"
                  checked={newAddr.saveForLater}
                  onCheckedChange={(v) =>
                    setNewAddr((a) => ({ ...a, saveForLater: Boolean(v) }))
                  }
                />
                <Label
                  htmlFor="save-addr"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  Guardar esta dirección para futuros pedidos
                </Label>
              </div>
            </div>
          )}
        </section>

        {/* Notas */}
        <section>
          <Label className="text-xs text-muted-foreground">
            Notas para el pedido (opcional)
          </Label>
          <Textarea
            className="mt-1 border-border bg-background text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones de entrega, mensaje de regalo, etc."
          />
        </section>
      </div>

      {/* Columna derecha: resumen */}
      <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 font-serif text-xl text-foreground">Resumen</h2>

        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col text-sm">
                <span className="line-clamp-2 font-medium text-foreground">
                  {item.title}
                </span>
                {item.variantName && (
                  <span className="text-xs text-muted-foreground">
                    {item.variantName}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  Cantidad: {item.quantity}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {fmt(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="text-foreground">
              {cityForShipping
                ? shippingCost === 0
                  ? "Gratis"
                  : fmt(shippingCost)
                : "—"}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-xl bg-foreground py-6 text-base text-background hover:bg-foreground/90"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar y pagar"
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Serás redirigido a Wompi para completar el pago.
        </p>
      </aside>
    </form>
  );
}
