import { z } from "zod";

// ─────────────────────────────────────────────────────────────────
// Reglas compartidas entre cliente (RHF) y servidor (Server Actions).
// ─────────────────────────────────────────────────────────────────

const passwordRule = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Incluye al menos una mayúscula",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Incluye al menos una minúscula",
  })
  .refine((v) => /\d/.test(v), {
    message: "Incluye al menos un número",
  });

const emailRule = z
  .string()
  .min(1, "Email requerido")
  .email("Email inválido")
  .max(255);

const nameRule = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(80, "Máximo 80 caracteres");

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Contraseña requerida"),
});

export const signupSchema = z
  .object({
    firstName: nameRule,
    lastName: nameRule,
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const forgotPasswordSchema = z.object({
  email: emailRule,
});

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─────────────────────────────────────────────────────────────────
// Strength meter (puramente UI, no lo usamos en el schema)
// ─────────────────────────────────────────────────────────────────

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function evaluatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Excelente"];
  return {
    score: Math.min(score, 4) as 0 | 1 | 2 | 3 | 4,
    label: labels[Math.min(score, 4)],
  };
}
