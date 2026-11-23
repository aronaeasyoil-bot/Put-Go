"use client";

import { useEffect } from "react";
import { useCart } from "./providers";

export function CartOpener({ label }: { label: string }) {
  const { setOpen } = useCart();
  useEffect(() => setOpen(true), [setOpen]);
  return (
    <button type="button" onClick={() => setOpen(true)} className="bg-ink px-8 py-4 text-sm uppercase tracking-wider text-white">
      {label}
    </button>
  );
}
