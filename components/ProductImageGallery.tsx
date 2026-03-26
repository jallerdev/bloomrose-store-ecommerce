"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: { src: string; alt: string }[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [isZoomed],
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Thumbnails - horizontal on mobile, vertical on desktop */}
      <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-x-visible">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 lg:h-20 lg:w-20",
              selectedIndex === index
                ? "border-primary ring-1 ring-primary/30"
                : "border-border hover:border-accent",
            )}
            aria-label={`Ver imagen ${index + 1}`}
            aria-current={selectedIndex === index ? "true" : undefined}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative order-1 flex-1 lg:order-2">
        <div
          className={cn(
            "relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary",
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          role="img"
          aria-label={images[selectedIndex]?.alt}
        >
          <Image
            src={images[selectedIndex]?.src ?? ""}
            alt={images[selectedIndex]?.alt ?? ""}
            fill
            className={cn(
              "object-cover transition-transform duration-300",
              isZoomed && "scale-[2]",
            )}
            style={
              isZoomed
                ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                : undefined
            }
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-card"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-card"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
