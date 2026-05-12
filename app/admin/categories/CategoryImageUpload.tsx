"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { uploadCategoryImageAction } from "./actions";

export function CategoryImageUpload() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se aceptan imágenes (JPG/PNG/WebP).");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadCategoryImageAction(fd);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (result.url) {
      setImageUrl(result.url);
      toast.success("Imagen subida");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  function clear() {
    setImageUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // ── Drag & drop handlers ────────────────────────────────────────────
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  return (
    <div>
      {/* Input file invisible, lo trigereamos desde el botón */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        disabled={uploading}
      />
      {/* Hidden field que el form lee como `imageUrl` */}
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-secondary">
          <Image
            src={imageUrl}
            alt="Vista previa"
            fill
            sizes="320px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
            aria-label="Quitar imagen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "relative aspect-[4/3] w-full rounded-lg border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-background hover:border-primary/50 hover:bg-secondary/30",
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg text-muted-foreground disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Subiendo…</span>
              </>
            ) : isDragging ? (
              <>
                <ImagePlus className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Suelta para subir
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">
                  Click o arrastra una imagen aquí
                </span>
                <span className="text-[10px] opacity-70">
                  JPG/PNG/WebP · máx 5MB
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
