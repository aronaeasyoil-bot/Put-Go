"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/shopify/types";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/format";
import { useCart } from "./providers";
import { WishlistButton } from "./wishlist-button";
import { WhatsAppIcon } from "./icons";

export function ProductForm({ product, locale, t, whatsappHref }: { product: Product; locale: Locale; t: Dictionary; whatsappHref: string }) {
  const { add, busy, configured, setOpen } = useCart();
  const realOptions = product.options.filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"));
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    return Object.fromEntries((firstAvailable?.selectedOptions ?? []).map((o) => [o.name, o.value]));
  });
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const variant = useMemo(
    () => product.variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)),
    [product.variants, selected],
  );
  const isAvailable = (name: string, value: string) =>
    product.variants.some((v) => v.availableForSale && v.selectedOptions.every((o) => (o.name === name ? o.value === value : selected[o.name] === o.value)));

  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compare = variant?.compareAtPrice;
  const canBuy = !!variant?.availableForSale && configured !== false;

  const submit = async (buyNow: boolean) => {
    if (!variant) return;
    setMessage(null);
    const cart = await add(variant.id, qty);
    if (!cart) return setMessage(t.cart.error);
    if (buyNow) window.location.href = cart.checkoutUrl;
    else {
      setMessage(t.product.added);
      setOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xl">
          {compare && Number(compare.amount) > Number(price.amount) && <s className="me-3 text-stone">{formatMoney(compare.amount, compare.currencyCode, locale)}</s>}
          <span>{formatMoney(price.amount, price.currencyCode, locale)}</span>
          <span className="ms-2 text-xs text-stone">{price.currencyCode}</span>
        </p>
        <p className="mt-1 text-xs text-stone">{t.product.priceNote}</p>
        <p className={`mt-3 text-sm ${variant?.availableForSale ? "text-emerald-700" : "text-red-700"}`}>{variant?.availableForSale ? t.product.inStock : t.product.outOfStock}</p>
      </div>

      {realOptions.map((o) => (
        <fieldset key={o.id}>
          <div className="mb-2 flex items-center justify-between">
            <legend className="eyebrow">{o.name}{selected[o.name] ? ` : ${selected[o.name]}` : ""}</legend>
            {/^(taille|size|pointure)$/i.test(o.name) && <Link href={`/${locale}/size-guide`} className="text-xs underline">{t.product.sizeGuide}</Link>}
          </div>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => {
              const avail = isAvailable(o.name, v);
              const active = selected[o.name] === v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected((s) => ({ ...s, [o.name]: v }))}
                  className={`min-h-11 min-w-12 border px-3 text-sm ${active ? "border-ink bg-ink text-white" : "border-line bg-white"} ${avail ? "" : "text-stone line-through"}`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center gap-4">
        <span className="eyebrow">{t.product.quantity}</span>
        <div className="flex items-center border border-line bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11" aria-label="−">−</button>
          <span className="w-8 text-center" aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} className="h-11 w-11" aria-label="+">+</button>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 space-y-2 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <button type="button" disabled={!canBuy || busy} onClick={() => submit(false)} className="bg-ink py-4 text-sm uppercase tracking-wider text-white disabled:opacity-40">{t.product.addToCart}</button>
          <button type="button" disabled={!canBuy || busy} onClick={() => submit(true)} className="border border-ink bg-white py-4 text-sm uppercase tracking-wider disabled:opacity-40">{t.product.buyNow}</button>
        </div>
        {message && <p role="status" className="text-sm">{message}</p>}
        {configured === false && <p className="text-xs text-stone">{t.cart.unavailable}</p>}
      </div>

      <WishlistButton withText item={{ handle: product.handle, title: product.title, image: product.featuredImage?.url, price: formatMoney(price.amount, price.currencyCode, locale) }} labelAdd={t.product.addToWishlist} labelIn={t.product.inWishlist} />
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-3.5 text-sm uppercase tracking-wider text-white">
        <WhatsAppIcon className="h-5 w-5" /> {t.product.whatsappEnquiry}
      </a>
    </div>
  );
}
