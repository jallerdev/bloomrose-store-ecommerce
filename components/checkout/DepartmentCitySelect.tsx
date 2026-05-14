"use client";

import { useId, useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COLOMBIA_DEPARTMENTS,
  getCitiesForDepartment,
} from "@/lib/colombia/locations";

interface Props {
  department: string;
  city: string;
  onDepartmentChange: (value: string) => void;
  onCityChange: (value: string) => void;
  inputClassName?: string;
  required?: boolean;
}

/**
 * Selector dependiente Departamento → Ciudad.
 * - Departamento es un <Select> estricto (32 opciones de DANE).
 * - Ciudad es <input> con <datalist> de los municipios del departamento:
 *   sugerencias rápidas para los listados, escritura libre para municipios
 *   pequeños no incluidos en la lista curada.
 */
export function DepartmentCitySelect({
  department,
  city,
  onDepartmentChange,
  onCityChange,
  inputClassName = "h-10 border-border bg-background text-sm",
  required,
}: Props) {
  const datalistId = useId();

  const cityOptions = useMemo(
    () => (department ? getCitiesForDepartment(department) : []),
    [department],
  );

  return (
    <>
      <div>
        <Label className="text-xs text-muted-foreground">Departamento</Label>
        <Select
          value={department}
          onValueChange={(v) => {
            onDepartmentChange(v);
            // Limpiar ciudad si cambia el depto y la ciudad actual no pertenece
            // al nuevo departamento.
            const nextCities = getCitiesForDepartment(v);
            if (city && !nextCities.includes(city)) {
              onCityChange("");
            }
          }}
        >
          <SelectTrigger
            className={inputClassName + " mt-1 w-full justify-between"}
            aria-required={required}
          >
            <SelectValue placeholder="Selecciona departamento" />
          </SelectTrigger>
          <SelectContent>
            {COLOMBIA_DEPARTMENTS.map((d) => (
              <SelectItem key={d.code} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Ciudad</Label>
        <Input
          className={inputClassName + " mt-1"}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          list={datalistId}
          placeholder={department ? "Selecciona o escribe" : "Elige departamento primero"}
          disabled={!department}
          required={required}
          autoComplete="address-level2"
        />
        <datalist id={datalistId}>
          {cityOptions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </>
  );
}