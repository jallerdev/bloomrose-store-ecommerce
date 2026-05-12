import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16 animate-pulse overflow-hidden rounded-full">
          <Image
            src="/images/image.webp"
            alt="Bloom Rose"
            fill
            sizes="64px"
            priority
            className="animate-spin object-cover [animation-duration:3s]"
          />
        </div>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}
