import { Flower2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-primary/10">
          <Flower2 className="h-7 w-7 animate-spin text-primary [animation-duration:2s]" />
        </div>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}
