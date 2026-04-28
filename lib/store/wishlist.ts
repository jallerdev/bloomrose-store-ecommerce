import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  addToWishlistAction,
  loadWishlistAction,
  removeFromWishlistAction,
  syncWishlistAction,
} from "@/app/wishlist/actions";

interface WishlistStore {
  /** Productos en favoritos (productIds). */
  items: string[];
  /** Usuario actual sincronizado. null = anónimo. */
  userId: string | null;
  /** True mientras se está sincronizando con el servidor. */
  syncing: boolean;

  has: (productId: string) => boolean;
  count: () => number;

  /**
   * Agrega/quita del store local y, si hay sesión, sincroniza con el servidor.
   * Optimista: no esperamos al servidor para reflejar el cambio en UI.
   */
  toggle: (productId: string) => Promise<void>;

  /**
   * Conecta el store al usuario actual.
   *  - Si pasamos de anónimo → autenticado: hace merge de los items locales con la DB.
   *  - Si pasamos de autenticado → anónimo (logout): limpia el store local.
   *  - Si el userId no cambió: no hace nada.
   */
  setUserId: (id: string | null) => Promise<void>;

  /** Limpia todo (uso interno para logout). */
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      syncing: false,

      has: (productId) => get().items.includes(productId),
      count: () => get().items.length,

      toggle: async (productId) => {
        const { items, userId } = get();
        const isFavorite = items.includes(productId);
        const nextItems = isFavorite
          ? items.filter((id) => id !== productId)
          : [...items, productId];

        // Optimista: actualizamos local primero
        set({ items: nextItems });

        if (userId) {
          try {
            if (isFavorite) {
              await removeFromWishlistAction(productId);
            } else {
              await addToWishlistAction(productId);
            }
          } catch (err) {
            // Si falla el server, revertimos local
            console.error("[wishlist.toggle] revert", err);
            set({ items });
          }
        }
      },

      setUserId: async (id) => {
        const prev = get().userId;
        if (prev === id) return;

        // Logout: limpiar todo
        if (prev && !id) {
          set({ userId: null, items: [] });
          return;
        }

        // Login: merge local → DB y leer estado final
        if (id) {
          const localItems = get().items;
          set({ userId: id, syncing: true });
          try {
            const merged = await syncWishlistAction(localItems);
            set({ items: merged, syncing: false });
          } catch (err) {
            console.error("[wishlist.setUserId] sync failed", err);
            // Fallback: leer lo que tenga el servidor
            try {
              const remote = await loadWishlistAction();
              set({ items: remote, syncing: false });
            } catch {
              set({ syncing: false });
            }
          }
        }
      },

      clear: () => set({ items: [], userId: null }),
    }),
    {
      name: "bloomrose-wishlist",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
