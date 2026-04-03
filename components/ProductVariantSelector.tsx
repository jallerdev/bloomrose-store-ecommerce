"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ProductVariantSelector({ product, variants }: any) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="text-3xl font-semibold text-foreground">
          ${Number(selectedVariant?.price || 0).toLocaleString("es-MX")}
        </span>
        {selectedVariant?.stock > 0 ? (
          <span className="text-sm font-medium text-emerald-600">
            En stock ({selectedVariant.stock})
          </span>
        ) : (
          <span className="text-sm font-medium text-destructive">Agotado</span>
        )}
      </div>

      {variants.length > 1 && (
        <div className="mb-8">
          <Label className="mb-3 block text-sm font-medium text-muted-foreground">
            Tipos Disponibles:
          </Label>
          <RadioGroup
            value={selectedVariant?.id}
            onValueChange={(val) =>
              setSelectedVariant(variants.find((v: any) => v.id === val))
            }
            className="flex flex-wrap gap-3"
          >
            {variants.map((v: any) => (
              <div key={v.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={v.id}
                  id={v.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={v.id}
                  className="rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-colors"
                >
                  {v.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {selectedVariant && (
        <AddToCartButton
          product={{
            id: selectedVariant.id,
            productId: product.id,
            title: product.title,
            price: Number(selectedVariant.price),
            imageUrl: product.images?.[0]?.url || "",
            stock: selectedVariant.stock,
            variantName: selectedVariant.name,
          }}
        />
      )}
    </div>
  );
}
