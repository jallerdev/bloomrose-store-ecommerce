import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // The composite unique ID (productId + variant)
  productId: string;
  title: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity" | "id"> & { quantity?: number },
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const compositeId = item.variant
          ? `${item.productId}-${item.variant}`
          : item.productId;
        const existingItem = items.find((i) => i.id === compositeId);
        const qtyToAdd = item.quantity || 1;

        if (existingItem) {
          const newQty = existingItem.quantity + qtyToAdd;
          if (newQty <= item.stock) {
            set({
              items: items.map((i) =>
                i.id === compositeId ? { ...i, quantity: newQty } : i,
              ),
            });
          }
        } else {
          if (item.stock >= qtyToAdd) {
            set({
              items: [
                ...items,
                { ...item, id: compositeId, quantity: qtyToAdd },
              ],
            });
          }
        }
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) }
              : i,
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
    }),
    {
      name: "bloomrose-cart-storage",
    },
  ),
);
