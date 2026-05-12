"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadCategoryImageAction } from "./actions";

export function CategoryImageUpload() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  function clear() {
    setImageUrl(null);
    if (inputRef.current) inputRef.current.value = "";
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary/30 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Subiendo…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs">Subir imagen</span>
              <span className="text-[10px] opacity-70">JPG/PNG/WebP · máx 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
