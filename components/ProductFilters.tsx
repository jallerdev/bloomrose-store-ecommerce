"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

export interface FilterFacets {
  categories: { slug: string; name: string }[];
  materials: string[];
  /** Rango global de precios en COP (min y max enteros). */
  priceRange: { min: number; max: number };
}

interface Props {
  facets: FilterFacets;
}

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function ProductFilters({ facets }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentMaterial = searchParams.get("material") ?? "";
  const currentMaxPrice = Number(
    searchParams.get("maxPrice") ?? facets.priceRange.max,
  );

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [price, setPrice] = useState([currentMaxPrice]);

  // Mantener los inputs sincronizados si cambian externamente (back/forward)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);
  useEffect(() => {
    setPrice([currentMaxPrice]);
  }, [currentMaxPrice]);

  const buildHref = useCallback(
    (mutations: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(mutations)) {
        if (v === undefined || v === "" || v === "all") {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      const qs = params.toString();
      return "/productos" + (qs ? `?${qs}` : "");
    },
    [searchParams],
  );

  // Debounce del input de búsqueda → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput === currentSearch) return;
      router.replace(buildHref({ q: searchInput.trim() || undefined }), {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleCategory = (value: string) => {
    router.push(buildHref({ category: value }), { scroll: false });
  };
  const handleMaterial = (value: string) => {
    router.push(buildHref({ material: value }), { scroll: false });
  };
  const handlePriceCommit = (value: number[]) => {
    setPrice(value);
    const v =
      value[0] >= facets.priceRange.max ? undefined : String(value[0]);
    router.push(buildHref({ maxPrice: v }), { scroll: false });
  };

  const clearFilters = () => {
    setSearchInput("");
    setPrice([facets.priceRange.max]);
    router.push("/productos", { scroll: false });
  };

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("category") ||
    searchParams.has("material") ||
    searchParams.has("maxPrice");

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
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpiar <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-6">
        {/* Búsqueda */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Aretes, perlas, oro..."
              className="h-10 border-border bg-background pl-9 pr-9 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <Separator />

        {/* Categorías */}
        {facets.categories.length > 0 && (
          <>
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-medium text-foreground">
                Categoría
              </Label>
              <div className="flex flex-wrap gap-2">
                <CategoryChip
                  active={!currentCategory}
                  onClick={() => handleCategory("all")}
                  label="Todas"
                />
                {facets.categories.map((c) => (
                  <CategoryChip
                    key={c.slug}
                    active={currentCategory === c.slug}
                    onClick={() => handleCategory(c.slug)}
                    label={c.name}
                  />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Material */}
        {facets.materials.length > 0 && (
          <>
            <div className="flex flex-col gap-2.5">
              <Label className="text-sm font-medium text-foreground">
                Material
              </Label>
              <Select
                value={currentMaterial || "all"}
                onValueChange={handleMaterial}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Todos los materiales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los materiales</SelectItem>
                  {facets.materials.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
          </>
        )}

        {/* Precio */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Precio máximo
            </Label>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {fmtCOP(price[0] ?? facets.priceRange.max)}
            </span>
          </div>
          <Slider
            value={price}
            onValueChange={setPrice}
            onValueCommit={handlePriceCommit}
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            step={Math.max(
              1000,
              Math.round((facets.priceRange.max - facets.priceRange.min) / 50),
            )}
            className="py-2"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{fmtCOP(facets.priceRange.min)}</span>
            <span>{fmtCOP(facets.priceRange.max)}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
