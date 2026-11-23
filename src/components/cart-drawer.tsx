"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/format";
import { SITE } from "@/lib/site";
import { useCart } from "./providers";
import { CloseIcon, WhatsAppIcon } from "./icons";

export function CartDrawer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { open, setOpen, cart, configured, busy, error, update, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[60] overflow-hidden ${open ? "" : "pointer-events-none invisible"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">{t.cart.title}</h2>
          <button type="button" onClick={() => setOpen(false)} className="p-2" aria-label={t.common.close}><CloseIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {configured === false ? (
            <div className="space-y-4 text-sm text-stone">
              <p>{t.cart.unavailable}</p>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] px-4 py-3 text-white"><WhatsAppIcon className="h-5 w-5" />{t.common.whatsappUs}</a>
            </div>
          ) : !cart || cart.lines.length === 0 ? (
            <p className="text-sm text-stone">{t.cart.empty}</p>
          ) : (
            <ul className="divide-y divide-line">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-4">
                  <div className="h-28 w-20 shrink-0 overflow-hidden bg-cream">
                    {line.merchandise.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${line.merchandise.image.url}${line.merchandise.image.url.includes("?") ? "&" : "?"}width=200`} alt={line.merchandise.image.altText ?? line.merchandise.product.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col text-sm">
                    <Link href={`/${locale}/products/${line.merchandise.product.handle}`} onClick={() => setOpen(false)} className="font-medium">{line.merchandise.product.title}</Link>
                    <span className="text-stone">{line.merchandise.selectedOptions.filter((o) => o.value !== "Default Title").map((o) => o.value).join(" · ")}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button type="button" disabled={busy} onClick={() => update(line.id, line.quantity - 1)} className="px-3 py-1" aria-label="−">−</button>
                        <span className="w-6 text-center" aria-live="polite">{line.quantity}</span>
                        <button type="button" disabled={busy} onClick={() => update(line.id, line.quantity + 1)} className="px-3 py-1" aria-label="+">+</button>
                      </div>
                      <span>{formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode, locale)}</span>
                    </div>
                    <button type="button" disabled={busy} onClick={() => remove(line.id)} className="mt-2 self-start text-xs text-stone underline">{t.cart.remove}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{t.cart.error}</p>}
        </div>
        {cart && cart.lines.length > 0 && (
          <div className="space-y-3 border-t border-line px-5 py-5">
            <div className="flex justify-between text-sm">
              <span>{t.cart.subtotal}</span>
              <span className="font-medium">{formatMoney(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode, locale)}</span>
            </div>
            <a href={cart.checkoutUrl} className="block bg-ink py-4 text-center text-sm uppercase tracking-wider text-white hover:bg-ink-soft">{t.cart.checkout}</a>
            <p className="text-xs text-stone">{t.cart.checkoutNote}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
