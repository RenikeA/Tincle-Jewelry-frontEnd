import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Cart, CartItem, AddToCartPayload } from "../types/cart";
import { CartService } from "../lib/api";

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  error: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (
    code: string
  ) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => Promise<void>;
  itemCount: () => number;
  subtotal: () => number;
  hasItem: (productId: string) => boolean;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isDrawerOpen: false,
      error: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.getCart();
          set({ cart });
        } catch {
          set({ error: "Failed to load cart" });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await CartService.addItem(payload);
          set({ cart, isDrawerOpen: true });
        } catch {
          set({ error: "Failed to add item" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (cartItemId, quantity) => {
        set({ isLoading: true });
        try {
          const cart = await CartService.updateItem({ cartItemId, quantity });
          set({ cart });
        } catch {
          set({ error: "Failed to update item" });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (cartItemId) => {
        set({ isLoading: true });
        try {
          const cart = await CartService.removeItem(cartItemId);
          set({ cart });
        } catch {
          set({ error: "Failed to remove item" });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await CartService.clearCart();
          set({ cart: null });
        } finally {
          set({ isLoading: false });
        }
      },

      applyCoupon: async (code) => {
        set({ isLoading: true });
        try {
          const result = await CartService.applyCoupon({ code });
          if (result.valid) await get().fetchCart();
          return { success: result.valid, message: result.message };
        } catch {
          return { success: false, message: "Failed to apply coupon" };
        } finally {
          set({ isLoading: false });
        }
      },

      removeCoupon: async () => {
        set({ isLoading: true });
        try {
          const cart = await CartService.removeCoupon();
          set({ cart });
        } finally {
          set({ isLoading: false });
        }
      },

      itemCount: () => get().cart?.itemCount ?? 0,
      subtotal: () => get().cart?.subtotal ?? 0,
      hasItem: (productId) =>
        get().cart?.items.some((i) => i.product.id === productId) ?? false,
      getItem: (productId) =>
        get().cart?.items.find((i) => i.product.id === productId),
    }),
    {
      name: "tincle-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isDrawerOpen: state.isDrawerOpen }),
    }
  )
);