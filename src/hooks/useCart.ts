import { useCallback } from "react";
import { useCartStore } from "../store/cartStore";
import { useUIStore } from "../store/uiStore";
import { AddToCartPayload } from "../types/cart";
import { ProductSummary } from "../types/product";

export const useCart = () => {
  const cartStore = useCartStore();
  const addToast = useUIStore((s) => s.addToast);

  const addToCart = useCallback(
    async (product: ProductSummary, payload: AddToCartPayload) => {
      await cartStore.addItem(payload);
      addToast({
        type: "success",
        message: `${product.name} added to your bag`,
      });
    },
    [cartStore, addToast]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string, productName: string) => {
      await cartStore.removeItem(cartItemId);
      addToast({
        type: "info",
        message: `${productName} removed from bag`,
      });
    },
    [cartStore, addToast]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (quantity < 1) return;
      await cartStore.updateItem(cartItemId, quantity);
    },
    [cartStore]
  );

  const applyDiscount = useCallback(
    async (code: string) => {
      const result = await cartStore.applyCoupon(code);
      addToast({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      return result.success;
    },
    [cartStore, addToast]
  );

  return {
    cart: cartStore.cart,
    isLoading: cartStore.isLoading,
    isDrawerOpen: cartStore.isDrawerOpen,
    itemCount: cartStore.itemCount(),
    subtotal: cartStore.subtotal(),
    openDrawer: cartStore.openDrawer,
    closeDrawer: cartStore.closeDrawer,
    fetchCart: cartStore.fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyDiscount,
    removeCoupon: cartStore.removeCoupon,
    clearCart: cartStore.clearCart,
    hasItem: cartStore.hasItem,
    getItem: cartStore.getItem,
  };
};