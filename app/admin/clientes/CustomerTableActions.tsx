"use client";

import { useState } from "react";
import {
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateUserRoleAction, deleteUserAction } from "../actions";
import { toast } from "sonner";

interface CustomerTableActionsProps {
  userId: string;
  userRole: "ADMIN" | "CUSTOMER";
  userEmail: string;
}

export function CustomerTableActions({
  userId,
  userRole,
  userEmail,
}: CustomerTableActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleRole = async () => {
    setIsLoading(true);
    const newRole = userRole === "ADMIN" ? "CUSTOMER" : "ADMIN";
    const result = await updateUserRoleAction(userId, newRole);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Rol actualizado a ${newRole}`);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar el perfil de ${userEmail}?`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    const result = await deleteUserAction(userId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuario eliminado correctamente");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleRole}>
          {userRole === "ADMIN" ? (
            <>
              <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
              <span>Quitar Admin</span>
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Hacer Admin</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Eliminar Perfil</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
