"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters, type FilterFacets } from "@/components/ProductFilters";

const FILTER_KEYS = [
  "q",
  "category",
  "material",
  "minPrice",
  "maxPrice",
  "onSale",
  "inStock",
  "isNew",
  "sort",
] as const;

export function MobileFiltersTrigger({ facets }: { facets: FilterFacets }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeCount = FILTER_KEYS.filter((k) => searchParams.has(k)).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full overflow-y-auto p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-left text-base">Filtros</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <ProductFilters facets={facets} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
