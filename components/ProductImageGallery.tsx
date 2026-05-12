"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: { src: string; alt: string }[];
}

const SWIPE_THRESHOLD = 50;

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const total = images.length;
  const current = images[selectedIndex];

  const goTo = useCallback(
    (next: number, dir: "left" | "right") => {
      if (total === 0) return;
      setDirection(dir);
      setSelectedIndex(((next % total) + total) % total);
    },
    [total],
  );

  const goPrev = useCallback(() => {
    goTo(selectedIndex - 1, "left");
  }, [selectedIndex, goTo]);

  const goNext = useCallback(() => {
    goTo(selectedIndex + 1, "right");
  }, [selectedIndex, goTo]);

  // Navegación con teclado cuando la galería tiene foco (o el lightbox abierto)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, isLightboxOpen]);

  // Bloquea scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (isLightboxOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isLightboxOpen]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  }

  if (total === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary" />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Imagen principal */}
        <div className="relative flex-1">
          <div
            ref={mainRef}
            className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Stack: cada imagen renderizada con opacity, así el cambio hace crossfade
                sin parpadeo blanco. Solo la activa tiene priority. */}
            {images.map((image, index) => {
              const active = index === selectedIndex;
              return (
                <Image
                  key={`${image.src}-${index}`}
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={active}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={cn(
                    "object-cover transition-all duration-500 ease-out",
                    active
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-[1.02] pointer-events-none",
                    active &&
                      direction === "right" &&
                      "animate-[slideInFromRight_400ms_ease-out]",
                    active &&
                      direction === "left" &&
                      "animate-[slideInFromLeft_400ms_ease-out]",
                  )}
                />
              );
            })}

            {/* Botón zoom (esquina superior derecha) */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Ver imagen en grande"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100 sm:right-4 sm:top-4"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            {/* Flechas */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100 sm:left-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100 sm:right-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Contador */}
            {total > 1 && (
              <div
                aria-hidden="true"
                className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm sm:bottom-4 sm:text-xs"
              >
                {selectedIndex + 1} / {total}
              </div>
            )}
          </div>

        </div>

        {/* Thumbnails — strip horizontal debajo de la imagen principal */}
        {total > 1 && (
          <div
            role="tablist"
            aria-label="Galería de imágenes"
            className="flex justify-center gap-2 overflow-x-auto pb-1 sm:gap-3"
          >
            {images.map((image, index) => {
              const active = selectedIndex === index;
              return (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Ver imagen ${index + 1} de ${total}`}
                  onClick={() =>
                    goTo(index, index > selectedIndex ? "right" : "left")
                  }
                  className={cn(
                    "group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200 sm:h-20 sm:w-20",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "ring-1 ring-border opacity-60 hover:opacity-100 hover:ring-foreground/40",
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-300",
                      !active && "group-hover:scale-105",
                    )}
                    sizes="80px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galería ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 px-4 py-6 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative h-full max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              key={`lb-${selectedIndex}`}
              src={current.src}
              alt={current.alt}
              fill
              priority
              sizes="100vw"
              className="object-contain animate-[fadeIn_300ms_ease-out]"
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Imagen anterior"
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-4"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Imagen siguiente"
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-4"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div
                  aria-hidden="true"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {selectedIndex + 1} / {total}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
