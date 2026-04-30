"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { evaluatePasswordStrength } from "@/lib/validation/auth";

interface Props {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: Props) {
  const { score, label } = useMemo(
    () => evaluatePasswordStrength(password),
    [password],
  );

  if (!password) return null;

  const colors = [
    "bg-destructive",
    "bg-destructive/80",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  const labelColors = [
    "text-destructive",
    "text-destructive",
    "text-amber-600",
    "text-emerald-600",
    "text-emerald-700",
  ];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? colors[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className={cn("text-[10px] font-medium", labelColors[score])}>
        {label}
      </p>
    </div>
  );
}
