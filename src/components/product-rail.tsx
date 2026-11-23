import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ProductCard } from "./product-card";

export function SectionHeading({ kicker, title, text, href, cta }: { kicker?: string; title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        {kicker && <p className="eyebrow mb-2 text-gold-deep">{kicker}</p>}
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 text-sm text-stone">{text}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="eyebrow shrink-0 border-b border-ink pb-1 hover:border-gold hover:text-gold-deep">{cta}</Link>
      )}
    </div>
  );
}

export function ProductRail({ products, locale, t, empty }: { products: Product[]; locale: Locale; t: Dictionary; empty?: React.ReactNode }) {
  if (!products.length) return <>{empty}</>;
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {products.slice(0, 8).map((p) => (
        <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
          <ProductCard product={p} locale={locale} t={t} />
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({ products, locale, t }: { products: Product[]; locale: Locale; t: Dictionary }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} locale={locale} t={t} priority={i < 4} />
      ))}
    </div>
  );
}
