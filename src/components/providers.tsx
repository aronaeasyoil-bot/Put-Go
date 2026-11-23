"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Cart } from "@/lib/shopify/types";

type CartState = {
  configured: boolean | null;
  cart: Cart | null;
  busy: boolean;
  error: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (merchandiseId: string, quantity: number) => Promise<Cart | null>;
  update: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

export type WishItem = { handle: string; title: string; image?: string; price?: string };
type WishState = { items: WishItem[]; has: (h: string) => boolean; toggle: (i: WishItem) => void };
const WishContext = createContext<WishState | null>(null);

const WISH_KEY = "pg_wishlist";

export function Providers({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WishItem[]>([]);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d: { configured: boolean; cart: Cart | null }) => {
        setConfigured(d.configured);
        setCart(d.cart);
      })
      .catch(() => setConfigured(false));
    try {
      const raw = localStorage.getItem(WISH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from browser storage once
      if (raw) setItems(JSON.parse(raw) as WishItem[]);
    } catch {}
  }, []);

  const mutate = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json()) as { cart?: Cart; configured?: boolean };
      if (!r.ok || !d.cart) throw new Error("cart");
      setCart(d.cart);
      return d.cart;
    } catch {
      setError(true);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const cartValue = useMemo<CartState>(
    () => ({
      configured,
      cart,
      busy,
      error,
      open,
      setOpen,
      add: (merchandiseId, quantity) => mutate({ action: "add", merchandiseId, quantity }),
      update: async (lineId, quantity) => void (await mutate({ action: "update", lineId, quantity })),
      remove: async (lineId) => void (await mutate({ action: "remove", lineId })),
    }),
    [configured, cart, busy, error, open, mutate],
  );

  const wishValue = useMemo<WishState>(
    () => ({
      items,
      has: (h) => items.some((i) => i.handle === h),
      toggle: (item) => {
        setItems((prev) => {
          const next = prev.some((i) => i.handle === item.handle) ? prev.filter((i) => i.handle !== item.handle) : [...prev, item];
          try {
            localStorage.setItem(WISH_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      },
    }),
    [items],
  );

  return (
    <CartContext.Provider value={cartValue}>
      <WishContext.Provider value={wishValue}>{children}</WishContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside Providers");
  return c;
}

export function useWishlist() {
  const c = useContext(WishContext);
  if (!c) throw new Error("useWishlist outside Providers");
  return c;
}
