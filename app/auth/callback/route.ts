import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handler que recibe el redirect de Supabase tras:
 *  - confirmación de email (signup)
 *  - link de recuperación de contraseña
 *  - login OAuth
 *
 * Toma `?code=` del query, intercambia por una sesión y redirige al `next`
 * deseado (o "/").
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(
        "Enlace inválido o expirado",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Si el `next` es la ruta de reset, mandamos allá; si no, al destino normal.
  return NextResponse.redirect(`${origin}${next}`);
}
