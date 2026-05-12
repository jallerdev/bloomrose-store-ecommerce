"use client";

import { useEffect, useRef } from "react";

import { analytics, type AnalyticsItem } from "@/lib/analytics";

interface Props {
  transactionId: string;
  value: number;
  shipping?: number;
  coupon?: string;
  items: AnalyticsItem[];
}

const STORAGE_PREFIX = "bloomrose:purchase-tracked:";

export function PurchaseTracker({
  transactionId,
  value,
  shipping,
  coupon,
  items,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    if (typeof window === "undefined") return;
    const key = STORAGE_PREFIX + transactionId;
    if (window.sessionStorage.getItem(key)) return;
    sent.current = true;
    window.sessionStorage.setItem(key, "1");
    analytics.purchase({
      transaction_id: transactionId,
      value,
      shipping,
      coupon,
      items,
    });
  }, [transactionId, value, shipping, coupon, items]);

  return null;
}
