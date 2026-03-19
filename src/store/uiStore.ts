import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProductSummary } from "../types/product";

export type Theme = "light" | "dark";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UIStore {
  theme: Theme;
  isSearchOpen: boolean;
  quickViewProduct: ProductSummary | null;
  toasts: Toast[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: ProductSummary) => void;
  closeQuickView: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      isSearchOpen: false,
      quickViewProduct: null,
      toasts: [],

      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
      openQuickView: (product) => set({ quickViewProduct: product }),
      closeQuickView: () => set({ quickViewProduct: null }),

      addToast: (toast) => {
        const id = `toast-${++toastCounter}`;
        const duration = toast.duration ?? 4000;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => get().removeToast(id), duration);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "tincle-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
    }
  )
);