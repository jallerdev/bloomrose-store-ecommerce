"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { useWishlistStore } from "@/lib/store/wishlist";

export function WishlistHeaderButton() {
  const [mounted, setMounted] = useState(false);
  const count = useWishlistStore((s) => s.items.length);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/favoritos"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
      aria-label={`Favoritos${mounted && count > 0 ? ` (${count})` : ""}`}
    >
      <Heart className="h-[18px] w-[18px]" />
      {mounted && count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
