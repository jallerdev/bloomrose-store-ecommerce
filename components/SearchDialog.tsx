"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const POPULAR = ["aretes", "collares", "pulseras", "anillos"];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setValue("");
  }, [open]);

  function submit(query: string) {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/productos?q=${encodeURIComponent(q)}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Buscar productos"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
      </DialogTrigger>
      <DialogContent className="top-[15%] translate-y-0 max-w-xl gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="flex items-center border-b border-border px-4"
        >
          <Search
            className="h-5 w-5 text-muted-foreground shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar productos"
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-4 text-base outline-none placeholder:text-muted-foreground"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Búsquedas populares
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => submit(term)}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                {term}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Presiona{" "}
            <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[10px] font-mono">
              Enter
            </kbd>{" "}
            para buscar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
