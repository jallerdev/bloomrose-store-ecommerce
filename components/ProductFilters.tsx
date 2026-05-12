"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export interface FilterFacets {
  categories: { slug: string; name: string }[];
  materials: string[];
  /** Rango global de precios en COP (min y max enteros). */
  priceRange: { min: number; max: number };
}

export const SORT_OPTIONS = [
  { value: "relevance", label: "Más relevantes" },
  { value: "newest", label: "Novedades" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A → Z" },
] as const;

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
  const currentMinPrice = Number(
    searchParams.get("minPrice") ?? facets.priceRange.min,
  );
  const currentMaxPrice = Number(
    searchParams.get("maxPrice") ?? facets.priceRange.max,
  );
  const currentOnSale = searchParams.get("onSale") === "1";
  const currentInStock = searchParams.get("inStock") === "1";
  const currentIsNew = searchParams.get("isNew") === "1";
  const currentSort = searchParams.get("sort") ?? "relevance";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentMinPrice,
    currentMaxPrice,
  ]);

  // Mantener los inputs sincronizados si cambian externamente (back/forward)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);
  useEffect(() => {
    setPriceRange([currentMinPrice, currentMaxPrice]);
  }, [currentMinPrice, currentMaxPrice]);

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
      const q = searchInput.trim();
      if (q) analytics.search(q);
      router.replace(buildHref({ q: q || undefined }), { scroll: false });
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
    const [min, max] = value;
    setPriceRange([min, max]);
    router.push(
      buildHref({
        minPrice: min <= facets.priceRange.min ? undefined : String(min),
        maxPrice: max >= facets.priceRange.max ? undefined : String(max),
      }),
      { scroll: false },
    );
  };
  const toggleParam = (key: string, on: boolean) => {
    router.push(buildHref({ [key]: on ? "1" : undefined }), { scroll: false });
  };
  const handleSort = (value: string) => {
    router.push(
      buildHref({ sort: value === "relevance" ? undefined : value }),
      { scroll: false },
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setPriceRange([facets.priceRange.min, facets.priceRange.max]);
    router.push("/productos", { scroll: false });
  };

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("category") ||
    searchParams.has("material") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("onSale") ||
    searchParams.has("inStock") ||
    searchParams.has("isNew") ||
    searchParams.has("sort");

  const sliderStep = Math.max(
    1000,
    Math.round((facets.priceRange.max - facets.priceRange.min) / 50),
  );

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
        {/* Ordenar */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Ordenar</Label>
          <Select value={currentSort} onValueChange={handleSort}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

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

        {/* Toggles rápidos */}
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Solo en oferta"
            checked={currentOnSale}
            onChange={(v) => toggleParam("onSale", v)}
          />
          <ToggleRow
            label="Solo con stock"
            checked={currentInStock}
            onChange={(v) => toggleParam("inStock", v)}
          />
          <ToggleRow
            label="Solo novedades"
            description="Agregados en los últimos 30 días"
            checked={currentIsNew}
            onChange={(v) => toggleParam("isNew", v)}
          />
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

        {/* Rango de precio */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Rango de precio
            </Label>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
              {fmtCOP(priceRange[0])}
            </span>
            <span className="text-muted-foreground">—</span>
            <span className="rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
              {fmtCOP(priceRange[1])}
            </span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange([v[0], v[1]])}
            onValueCommit={handlePriceCommit}
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            step={sliderStep}
            minStepsBetweenThumbs={1}
            className="py-2"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{fmtCOP(facets.priceRange.min)}</span>
            <span>{fmtCOP(facets.priceRange.max)}</span>
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-[11px] text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
