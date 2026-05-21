import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

interface CartItem {
  product: Product;
  qty: number;
  size: string;
  color: string;
}

interface State {
  cart: CartItem[];
  wishlist: string[];
  theme: "light" | "dark";
  addToCart: (p: Product, size?: string, color?: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  toggleTheme: () => void;
}

export const useShop = create<State>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      theme: "light",
      addToCart: (p, size, color, qty = 1) => {
        const cart = [...get().cart];
        const i = cart.findIndex((x) => x.product.id === p.id);
        if (i >= 0) cart[i] = { ...cart[i], qty: cart[i].qty + qty };
        else cart.push({ product: p, qty, size: size || p.sizes[0], color: color || p.colors[0] });
        set({ cart });
      },
      removeFromCart: (id) => set({ cart: get().cart.filter((x) => x.product.id !== id) }),
      updateQty: (id, qty) =>
        set({ cart: get().cart.map((x) => (x.product.id === id ? { ...x, qty: Math.max(1, qty) } : x)) }),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (id) => {
        const w = get().wishlist;
        set({ wishlist: w.includes(id) ? w.filter((x) => x !== id) : [...w, id] });
      },
      toggleTheme: () => {
        const t = get().theme === "light" ? "dark" : "light";
        set({ theme: t });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", t === "dark");
        }
      },
    }),
    { name: "shopee-mania" }
  )
);
