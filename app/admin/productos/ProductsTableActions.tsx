"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { deleteProductAction } from "@/app/admin/actions";

export function ProductsTableActions({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (
      !confirm(
        "¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.",
      )
    )
      return;
    const result = await deleteProductAction(productId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Producto eliminado correctamente.");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Acciones del producto"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link
            href={`/productos/${slug}`}
            target="_blank"
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver en tienda
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/admin/productos/${productId}/editar`}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
