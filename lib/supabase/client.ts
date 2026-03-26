import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export function createClient() {
  // `createBrowserClient` automáticamente usa el patrón Singleton
  // en el navegador (crea la instancia una vez y la reutiliza).
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
