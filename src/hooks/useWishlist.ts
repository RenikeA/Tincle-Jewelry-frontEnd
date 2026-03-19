import { useCallback } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import { useUIStore } from "../store/uiStore";
import { ProductSummary } from "../types/product";
import { storage } from "../lib/utils";

export const useWishlist = () => {
  const wishlistStore = useWishlistStore();
  const addToast = useUIStore((s) => s.addToast);

  const toggle = useCallback(
    async (product: ProductSummary) => {
      const wasWishlisted = wishlistStore.isWishlisted(product.id);
      await wishlistStore.toggleItem(product.id);
      addToast({
        type: "success",
        message: wasWishlisted
          ? `${product.name} removed from wishlist`
          : `${product.name} added to wishlist`,
      });
    },
    [wishlistStore, addToast]
  );

  return {
    items: wishlistStore.items,
    count: wishlistStore.count(),
    isWishlisted: wishlistStore.isWishlisted,
    toggle,
    fetchWishlist: wishlistStore.fetchWishlist,
    isLoading: wishlistStore.isLoading,
  };
};

const RECENTLY_VIEWED_KEY = "tincle-recently-viewed";
const MAX_RECENT = 8;

export const useRecentlyViewed = () => {
  const getItems = () =>
    storage.get<ProductSummary[]>(RECENTLY_VIEWED_KEY) ?? [];

  const addItem = useCallback((product: ProductSummary) => {
    const existing = getItems().filter((p) => p.id !== product.id);
    const updated = [product, ...existing].slice(0, MAX_RECENT);
    storage.set(RECENTLY_VIEWED_KEY, updated);
  }, []);

  return {
    recentlyViewed: getItems(),
    addItem,
  };
};

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useUIStore();
  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
};