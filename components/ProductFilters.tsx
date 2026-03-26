"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMaterial = searchParams.get("material") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "1000";

  const [price, setPrice] = useState([Number(currentMaxPrice)]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "1000" && value !== "") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleMaterialChange = (value: string) => {
    const qs = createQueryString("material", value === "all" ? "" : value);
    router.push("/products" + (qs ? `?${qs}` : ""), { scroll: false });
  };

  const handlePriceCommit = (value: number[]) => {
    setPrice(value);
    const qs = createQueryString("maxPrice", String(value[0]));
    router.push("/products" + (qs ? `?${qs}` : ""), { scroll: false });
  };

  const clearFilters = () => {
    setPrice([1000]);
    router.push("/products", { scroll: false });
  };

  const hasFilters =
    searchParams.has("material") || searchParams.has("maxPrice");

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Filtros
        </h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpiar <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-6">
        {/* Material Filter */}
        <div className="flex flex-col gap-2.5">
          <Label className="text-sm font-medium text-foreground">
            Material
          </Label>
          <Select
            value={currentMaterial || "all"}
            onValueChange={handleMaterialChange}
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Todos los materiales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los materiales</SelectItem>
              <SelectItem value="Oro 18k">Oro 18k</SelectItem>
              <SelectItem value="Plata 925">Plata 925</SelectItem>
              <SelectItem value="Acero Inoxidable">Acero Inoxidable</SelectItem>
              <SelectItem value="Cuero">Cuero</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Filter */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Precio Maximo
            </Label>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              ${price[0]}
            </span>
          </div>
          <Slider
            value={price}
            onValueChange={setPrice}
            onValueCommit={handlePriceCommit}
            min={0}
            max={1000}
            step={10}
            className="py-2"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
