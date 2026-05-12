// Wrappers tipados sobre window.gtag / window.fbq.
// Si no hay IDs configurados o el script aún no cargó, las llamadas son no-op.

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_variant?: string;
  item_category?: string;
  price: number;
  quantity?: number;
}

type GtagFn = (...args: unknown[]) => void;
type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
    dataLayer?: unknown[];
  }
}

const CURRENCY = "COP";

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

function fbq(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.fbq?.(...args);
}

function totalValue(items: AnalyticsItem[]) {
  return items.reduce(
    (sum, i) => sum + i.price * (i.quantity ?? 1),
    0,
  );
}

export const analytics = {
  viewItem(item: AnalyticsItem) {
    gtag("event", "view_item", {
      currency: CURRENCY,
      value: item.price,
      items: [item],
    });
    fbq("track", "ViewContent", {
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_type: "product",
      value: item.price,
      currency: CURRENCY,
    });
  },

  addToCart(item: AnalyticsItem) {
    const value = item.price * (item.quantity ?? 1);
    gtag("event", "add_to_cart", {
      currency: CURRENCY,
      value,
      items: [item],
    });
    fbq("track", "AddToCart", {
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_type: "product",
      value,
      currency: CURRENCY,
    });
  },

  addToWishlist(item: AnalyticsItem) {
    gtag("event", "add_to_wishlist", {
      currency: CURRENCY,
      value: item.price,
      items: [item],
    });
    fbq("track", "AddToWishlist", {
      content_ids: [item.item_id],
      content_name: item.item_name,
      value: item.price,
      currency: CURRENCY,
    });
  },

  beginCheckout(items: AnalyticsItem[], coupon?: string) {
    const value = totalValue(items);
    gtag("event", "begin_checkout", {
      currency: CURRENCY,
      value,
      coupon,
      items,
    });
    fbq("track", "InitiateCheckout", {
      content_ids: items.map((i) => i.item_id),
      contents: items.map((i) => ({
        id: i.item_id,
        quantity: i.quantity ?? 1,
      })),
      num_items: items.reduce((s, i) => s + (i.quantity ?? 1), 0),
      value,
      currency: CURRENCY,
    });
  },

  purchase(args: {
    transaction_id: string;
    value: number;
    shipping?: number;
    coupon?: string;
    items: AnalyticsItem[];
  }) {
    gtag("event", "purchase", {
      transaction_id: args.transaction_id,
      currency: CURRENCY,
      value: args.value,
      shipping: args.shipping,
      coupon: args.coupon,
      items: args.items,
    });
    fbq("track", "Purchase", {
      content_ids: args.items.map((i) => i.item_id),
      contents: args.items.map((i) => ({
        id: i.item_id,
        quantity: i.quantity ?? 1,
      })),
      value: args.value,
      currency: CURRENCY,
    });
  },

  search(searchTerm: string) {
    if (!searchTerm) return;
    gtag("event", "search", { search_term: searchTerm });
    fbq("track", "Search", { search_string: searchTerm });
  },
};
