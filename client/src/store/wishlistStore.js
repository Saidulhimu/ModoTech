import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const exists = get().items.find((item) => item._id === product._id);
        if (exists) {
          set({ items: get().items.filter((item) => item._id !== product._id) });
        } else {
          set({ items: [...get().items, product] });
        }
      },

      isWishlisted: (productId) => !!get().items.find((item) => item._id === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'modotech-wishlist',
    }
  )
);

