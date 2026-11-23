"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/lib/shopify/types";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ProductCard } from "./product-card";
import { CloseIcon } from "./icons";

const SIZE_NAMES = /^(taille|size|pointure|المقاس)$/i;
const COLOR_NAMES = /^(couleur|color|colour|اللون)$/i;

function optionValues(products: Product[], re: RegExp) {
  const set = new Set<string>();
  for (const p of products) for (const o of p.options) if (re.test(o.name)) o.values.forEach((v) => set.add(v));
  return Array.from(set);
}

export function CatalogBrowser({ products, locale, t, subs }: { products: Product[]; locale: Locale; t: Dictionary; subs: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const sub = params.get("sub") ?? "";
  const sort = params.get("sort") ?? "featured";

  const allSizes = useMemo(() => optionValues(products, SIZE_NAMES), [products]);
  const allColors = useMemo(() => optionValues(products, COLOR_NAMES), [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (sub) {
        const s = sub.toLowerCase();
        const match = p.tags.some((tag) => tag.toLowerCase() === `sub:${s}`) || p.productType.toLowerCase().replace(/\s+/g, "-") === s;
        if (!match) return false;
      }
      const has = (re: RegExp, wanted: string[]) =>
        !wanted.length || p.variants.some((v) => v.availableForSale && v.selectedOptions.some((o) => re.test(o.name) && wanted.includes(o.value)));
      if (!has(SIZE_NAMES, sizes) || !has(COLOR_NAMES, colors)) return false;
      const price = Number(p.priceRange.minVariantPrice.amount);
      if (min && price < Number(min)) return false;
      if (max && price > Number(max)) return false;
      return true;
    });
  }, [products, sub, sizes, colors, min, max]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const activeCount = sizes.length + colors.length + (min ? 1 : 0) + (max ? 1 : 0);

  const filterBody = (
    <div className="space-y-8 text-sm">
      {allSizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">{t.shop.size}</legend>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button key={s} type="button" aria-pressed={sizes.includes(s)} onClick={() => toggle(sizes, setSizes, s)} className={`min-w-11 border px-3 py-2 ${sizes.includes(s) ? "border-ink bg-ink text-white" : "border-line"}`}>{s}</button>
            ))}
          </div>
        </fieldset>
      )}
      {allColors.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3">{t.shop.color}</legend>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button key={c} type="button" aria-pressed={colors.includes(c)} onClick={() => toggle(colors, setColors, c)} className={`border px-3 py-2 ${colors.includes(c) ? "border-ink bg-ink text-white" : "border-line"}`}>{c}</button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-3">{t.shop.price}</legend>
        <div className="flex items-center gap-2">
          <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder={t.shop.priceMin} aria-label={t.shop.priceMin} className="w-full border border-line bg-white px-3 py-2" />
          <span>–</span>
          <input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={t.shop.priceMax} aria-label={t.shop.priceMax} className="w-full border border-line bg-white px-3 py-2" />
        </div>
      </fieldset>
      {activeCount > 0 && (
        <button type="button" onClick={() => { setSizes([]); setColors([]); setMin(""); setMax(""); }} className="underline">{t.shop.clear}</button>
      )}
    </div>
  );

  return (
    <div>
      {subs.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {["", ...subs].map((s) => (
            <button key={s || "all"} type="button" onClick={() => setParam("sub", s)} className={`shrink-0 border px-4 py-2 text-sm ${sub === s ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
              {s ? t.sub[s as keyof Dictionary["sub"]] : t.shop.all}
            </button>
          ))}
        </div>
      )}
      <div className="mb-6 flex items-center justify-between gap-3 border-y border-line py-3 text-sm">
        <button type="button" onClick={() => setOpen(true)} className="eyebrow lg:hidden">{t.shop.filters}{activeCount ? ` (${activeCount})` : ""}</button>
        <span className="hidden text-stone lg:inline">{filtered.length} {t.shop.results}</span>
        <label className="flex items-center gap-2">
          <span className="eyebrow text-stone">{t.shop.sort}</span>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)} className="bg-transparent py-1">
            <option value="featured">{t.shop.sortFeatured}</option>
            <option value="new">{t.shop.sortNew}</option>
            <option value="price-asc">{t.shop.sortPriceAsc}</option>
            <option value="price-desc">{t.shop.sortPriceDesc}</option>
          </select>
        </label>
      </div>
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">{filterBody}</aside>
        <div>
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} locale={locale} t={t} priority={i < 4} />)}
            </div>
          ) : (
            <p className="py-10 text-sm text-stone">{t.shop.noProducts}</p>
          )}
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filters}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto bg-paper p-5">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">{t.shop.filters}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.common.close} className="p-2"><CloseIcon className="h-6 w-6" /></button>
            </div>
            {filterBody}
            <button type="button" onClick={() => setOpen(false)} className="mt-8 w-full bg-ink py-4 text-sm uppercase tracking-wider text-white">{t.shop.apply} ({filtered.length})</button>
          </div>
        </div>
      )}
    </div>
  );
}
