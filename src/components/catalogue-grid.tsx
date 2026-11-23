/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { catalogue, catalogueImage, catalogueText, priceEnquiryUrl, type CatalogueItem } from "@/content/catalogue";
import { formatMoney } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export function PriceButton({ item, locale, large }: { item: CatalogueItem; locale: Locale; large?: boolean }) {
  const t = catalogueText[locale];
  if (item.price) return <p className={large ? "text-lg" : "text-sm"}>{formatMoney(String(item.price), "XOF", locale)}</p>;
  const href = priceEnquiryUrl(locale, item, `${siteUrl()}/${locale}/catalogue/${item.slug}`);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={large
        ? "group inline-flex items-center gap-3 border border-gold bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-gold-light transition-colors hover:bg-gold hover:text-ink"
        : "group inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-gold-deep hover:text-ink"}>
      <WhatsAppIcon className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      <span className={large ? "" : "border-b border-gold/60 pb-0.5"}>{t.discoverPrice}</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180">›</span>
    </a>
  );
}

export function CatalogueCard({ item, locale }: { item: CatalogueItem; locale: Locale }) {
  const second = item.images[1];
  const href = `/${locale}/catalogue/${item.slug}`;
  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <img src={catalogueImage(item.images[0])} alt={item.name[locale]} loading="lazy" decoding="async" style={{ objectPosition: "50% 20%" }} className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
          {second && <img src={catalogueImage(second)} alt="" loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" style={{ objectPosition: "50% 20%" }} />}
        </div>
        <h3 className="mt-4 text-sm leading-snug group-hover:text-gold-deep">{item.name[locale]}</h3>
      </Link>
      <div className="mt-2"><PriceButton item={item} locale={locale} /></div>
    </article>
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
