"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCategory } from "./actions";

interface Props {
  id: string;
  name: string;
}

export function CategoryDeleteButton({ id, name }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !window.confirm(
        `¿Eliminar la categoría "${name}"? Los productos vinculados perderán su categoría.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Categoría eliminada");
      } catch {
        toast.error("No se pudo eliminar la categoría");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      aria-label={`Eliminar ${name}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
