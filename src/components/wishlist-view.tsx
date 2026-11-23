"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { useWishlist } from "./providers";
import { WishlistButton } from "./wishlist-button";

export function WishlistView({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { items } = useWishlist();
  if (!items.length) return <p className="text-sm text-stone">{t.wishlist.empty}</p>;
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-4">
      {items.map((i) => (
        <li key={i.handle} className="relative">
          <Link href={`/${locale}/products/${i.handle}`} className="block">
            <div className="aspect-[3/4] overflow-hidden bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.image && <img src={i.image} alt={i.title} loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <p className="mt-3 pe-8 text-sm">{i.title}</p>
            {i.price && <p className="text-sm text-stone">{i.price}</p>}
          </Link>
          <div className="absolute bottom-0 end-0">
            <WishlistButton item={i} labelAdd={t.product.addToWishlist} labelIn={t.product.inWishlist} />
          </div>
        </li>
      ))}
    </ul>
  );
}
