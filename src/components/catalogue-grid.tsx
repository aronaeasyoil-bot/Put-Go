/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { catalogue, catalogueImage, catalogueText, type CatalogueItem } from "@/content/catalogue";
import { formatMoney } from "@/lib/format";

export function CatalogueCard({ item, locale }: { item: CatalogueItem; locale: Locale }) {
  const t = catalogueText[locale];
  const second = item.images[1];
  return (
    <Link href={`/${locale}/catalogue/${item.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <img src={catalogueImage(item.images[0])} alt={item.name[locale]} loading="lazy" decoding="async" style={{ objectPosition: "50% 20%" }} className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
        {second && <img src={catalogueImage(second)} alt="" loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" style={{ objectPosition: "50% 20%" }} />}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm leading-snug group-hover:text-gold-deep">{item.name[locale]}</h3>
        <p className="text-xs uppercase tracking-[0.15em] text-stone">{item.price ? formatMoney(String(item.price), "XOF", locale) : t.priceOnRequest}</p>
      </div>
    </Link>
  );
}

export function CatalogueGrid({ locale, limit }: { locale: Locale; limit?: number }) {
  const items = limit ? catalogue.slice(0, limit) : catalogue;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => <CatalogueCard key={item.slug} item={item} locale={locale} />)}
    </div>
  );
}
