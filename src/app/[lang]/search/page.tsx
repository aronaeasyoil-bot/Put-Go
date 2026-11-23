import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { searchProducts } from "@/lib/shopify";
import { ProductGrid } from "@/components/product-rail";
import { EmptyCatalog } from "@/components/empty-catalog";
import { SearchIcon } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/search">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).search.title, robots: { index: false } } : {};
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const products = q ? await searchProducts(lang, { query: q, first: 48 }) : [];
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      <h1 className="font-display text-4xl">{t.search.title}</h1>
      <form action={`/${lang}/search`} role="search" className="my-8 flex max-w-xl items-center gap-3 border-b border-ink">
        <SearchIcon className="h-5 w-5" />
        <input name="q" type="search" defaultValue={q} placeholder={t.common.searchPlaceholder} aria-label={t.common.search} className="w-full bg-transparent py-3 text-base focus:outline-none" />
      </form>
      {q && <p className="mb-6 text-sm text-stone">{t.search.resultsFor} « {q} » — {products.length} {t.shop.results}</p>}
      {q && !products.length ? <EmptyCatalog text={t.search.noResults} cta={t.shop.browseWhatsapp} /> : <ProductGrid products={products} locale={lang} t={t} />}
    </div>
  );
}
