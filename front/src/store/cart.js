import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// persist save the cart items to localStorage
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, qty = 1) => {
        const items = [...get().items];
        const i = items.findIndex((item) => item.productId === productId);

        if (i >= 0) {
          items[i] = { ...items[i], quantity: items[i].quantity + qty };
        } else {
          items.push({ productId, quantity: qty });
        }
        set({ items });
      },

      clear: () => set({ items: [] }),
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      setQty: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId ? { ...item, quantity } : i,
        );
        set({ items });
      },
    }),
    { name: 'windCommerce-cart' },
  ),
);
