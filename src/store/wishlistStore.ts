import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WishlistItem } from "../types/user";
import { UserService } from "../lib/api";

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const wishlist = await UserService.getWishlist();
          set({ items: wishlist.items });
        } catch {
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId) => {
        set({ isLoading: true });
        try {
          const wishlist = await UserService.addToWishlist(productId);
          set({ items: wishlist.items });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (productId) => {
        set((s) => ({
          items: s.items.filter((i) => i.productId !== productId),
        }));
        try {
          await UserService.removeFromWishlist(productId);
        } catch {
          get().fetchWishlist();
        }
      },

      toggleItem: async (productId) => {
        if (get().isWishlisted(productId)) {
          await get().removeItem(productId);
        } else {
          await get().addItem(productId);
        }
      },

      isWishlisted: (productId) =>
        get().items.some((i) => i.productId === productId),

      count: () => get().items.length,
    }),
    {
      name: "tincle-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);