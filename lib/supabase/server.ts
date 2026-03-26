import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { cache } from "react";

// Usamos `cache` de React para mantener un patrón Singleton por cada solicitud
// (per-request singleton), lo que es recomendado en Server Components.
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se ignora el error si se llama `setAll` desde un Server Component.
            // Esto sucede porque los Server Components no pueden configurar cookies a menos
            // que se haga a través de Server Actions o Middleware.
          }
        },
      },
    },
  );
});
