"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface AppliedPromo {
  code: string;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  appliedPromo: AppliedPromo | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setPromo: (promo: AppliedPromo | null) => void;
  clearPromo: () => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  subtotal: () => number;
  discountAmount: () => number;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromo: null,
      addItem: (item) => {
        const existing = get().items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
            appliedPromo: null,
          });
        } else {
          set({
            items: [...get().items, { ...item, quantity: 1 }],
            appliedPromo: null,
          });
        }
      },
      removeItem: (menuItemId) => {
        set({
          items: get().items.filter((i) => i.menuItemId !== menuItemId),
          appliedPromo: null,
        });
      },
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
          appliedPromo: null,
        });
      },
      setPromo: (promo) => set({ appliedPromo: promo }),
      clearPromo: () => set({ appliedPromo: null }),
      clearCart: () => set({ items: [], appliedPromo: null }),
      setItems: (items) => set({ items, appliedPromo: null }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      discountAmount: () => get().appliedPromo?.discountAmount ?? 0,
      totalAmount: () => {
        const subtotal = get().subtotal();
        const discount = get().discountAmount();
        return Math.max(0, subtotal - discount);
      },
      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "termiz-cart-v4" },
  ),
);
