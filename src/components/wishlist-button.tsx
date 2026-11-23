"use client";

import { useWishlist, type WishItem } from "./providers";
import { HeartIcon } from "./icons";

export function WishlistButton({ item, labelAdd, labelIn, withText }: { item: WishItem; labelAdd: string; labelIn: string; withText?: boolean }) {
  const { has, toggle } = useWishlist();
  const active = has(item.handle);
  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={active}
      aria-label={active ? labelIn : labelAdd}
      className={withText ? "flex w-full items-center justify-center gap-2 border border-ink py-3.5 text-sm uppercase tracking-wider hover:bg-ink hover:text-white" : "p-1.5"}
    >
      <HeartIcon className={`h-5 w-5 ${active ? "text-gold-deep" : ""}`} filled={active} />
      {withText && <span>{active ? labelIn : labelAdd}</span>}
    </button>
  );
}
