import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // The product_variant_id
  productId: string; // Reference to the parent product (for links/images)
  title: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
  variantName?: string;
}

interface CartStore {
  items: CartItem[];
  userId: string | null;
  setUserId: (id: string | null) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
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
      userId: null,
      setUserId: (id) => set({ userId: id }),
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);
        const qtyToAdd = item.quantity || 1;

        if (existingItem) {
          const newQty = existingItem.quantity + qtyToAdd;
          if (newQty <= item.stock) {
            set({
              items: items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i,
              ),
            });
          }
        } else {
          if (item.stock >= qtyToAdd) {
            set({
              items: [...items, { ...item, quantity: qtyToAdd }],
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
