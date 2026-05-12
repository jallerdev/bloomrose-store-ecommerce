"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  returnTo: string;
}

export function OAuthButtons({ returnTo }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const next = encodeURIComponent(returnTo || "/");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${next}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // Si todo va bien Supabase redirige a Google y nunca llega aquí.
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}
        Continuar con Google
      </Button>

      <div className="relative">
        <div
          className="absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-card px-2 text-muted-foreground">
            o con tu correo
          </span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.96h5.51c-.24 1.42-1.7 4.16-5.51 4.16-3.31 0-6.01-2.74-6.01-6.12s2.7-6.12 6.01-6.12c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.85 3.6 14.66 2.7 12 2.7 6.94 2.7 2.85 6.79 2.85 12s4.09 9.3 9.15 9.3c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.06-.15-1.51H12z"
      />
    </svg>
  );
}
