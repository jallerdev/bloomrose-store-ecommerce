"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Sparkles, Package, BookOpen } from "lucide-react";

interface VariantSpec {
  sku: string;
  name: string | null;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
}

interface Props {
  description: string;
  variants: VariantSpec[];
  category: string;
}

export function ProductDetailsTabs({ description, variants, category }: Props) {
  return (
    <Tabs defaultValue="descripcion" className="w-full">
      <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent p-0">
        <TabTrig value="descripcion" icon={<BookOpen className="h-4 w-4" />}>
          Descripción
        </TabTrig>
        <TabTrig value="detalles" icon={<Package className="h-4 w-4" />}>
          Especificaciones
        </TabTrig>
        <TabTrig value="cuidados" icon={<Sparkles className="h-4 w-4" />}>
          Cuidados
        </TabTrig>
        <TabTrig value="envios" icon={<Truck className="h-4 w-4" />}>
          Envíos
        </TabTrig>
      </TabsList>

      <TabsContent value="descripcion" className="mt-6">
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p className="leading-relaxed">{description}</p>
        </div>
      </TabsContent>

      <TabsContent value="detalles" className="mt-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Variante</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-right">Peso</th>
                <th className="px-4 py-2 text-right">Dimensiones</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr
                  key={v.sku}
                  className="border-t border-border text-foreground"
                >
                  <td className="px-4 py-3">{v.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {v.sku}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {v.weightGrams ? `${v.weightGrams} g` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {v.lengthCm && v.widthCm && v.heightCm
                      ? `${v.lengthCm} × ${v.widthCm} × ${v.heightCm} cm`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Categoría: {category}
        </p>
      </TabsContent>

      <TabsContent value="cuidados" className="mt-6">
        <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
          <CareItem text="Evita el contacto con agua, perfumes, cremas y productos de limpieza." />
          <CareItem text="Guarda cada pieza en su bolsita individual para evitar rayones." />
          <CareItem text="Limpia con un paño suave y seco. No uses químicos abrasivos." />
          <CareItem text="No expongas tus accesorios al sol directo por períodos prolongados." />
          <CareItem text="Retíralos antes de hacer ejercicio, dormir o ducharte." />
        </ul>
      </TabsContent>

      <TabsContent value="envios" className="mt-6">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>
            Realizamos envíos a toda Colombia a través de{" "}
            <strong className="text-foreground">Coordinadora</strong>.
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <strong className="text-foreground">Envío gratis</strong> en pedidos
              superiores a $200.000.
            </li>
            <li>
              <strong className="text-foreground">Tiempo de entrega:</strong> 2 a
              5 días hábiles según la ciudad.
            </li>
            <li>
              <strong className="text-foreground">Rastreo:</strong> recibirás el
              número de guía por correo apenas tu pedido salga de bodega.
            </li>
            <li>
              <strong className="text-foreground">Devoluciones:</strong> solo
              por defectos de fábrica. Tienes 5 días desde la entrega para
              reportarlo. No aceptamos cambios.
            </li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function TabTrig({
  value,
  icon,
  children,
}: {
  value: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
    >
      {icon}
      {children}
    </TabsTrigger>
  );
}

function CareItem({ text }: { text: string }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
      <span>{text}</span>
    </li>
  );
}
