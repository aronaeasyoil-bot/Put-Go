import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { getDepartment, isDepartment } from "@/lib/catalog-structure";
import { getCollectionProducts, type SortKey } from "@/lib/shopify";
import { pageMetadata } from "@/lib/seo";
import { CatalogBrowser } from "@/components/catalog-browser";
import { EmptyCatalog } from "@/components/empty-catalog";

const SORTS: SortKey[] = ["featured", "new", "price-asc", "price-desc"];

export async function generateMetadata({ params }: PageProps<"/[lang]/shop/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!hasLocale(lang) || !isDepartment(category)) return {};
  const t = getDictionary(lang);
  return { title: t.nav[category], description: `${t.nav[category]} — ${t.meta.description}`, ...pageMetadata(lang, `/shop/${category}`) };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/shop/[category]">) {
  const { lang, category } = await params;
  if (!hasLocale(lang) || !isDepartment(category)) notFound();
  const sp = await searchParams;
  const sortParam = typeof sp.sort === "string" ? sp.sort : "featured";
  const sort = (SORTS as string[]).includes(sortParam) ? (sortParam as SortKey) : "featured";
  const t = getDictionary(lang);
  const dept = getDepartment(category);
  const products = await getCollectionProducts(category, lang, { first: 100, sort });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone">
        <a href={`/${lang}`} className="hover:underline">PUT &amp; GO</a> / <span className="text-ink">{t.nav[category]}</span>
      </nav>
      <h1 className="mb-8 font-display text-4xl sm:text-5xl">{t.nav[category]}</h1>
      {products.length ? (
        <Suspense>
          <CatalogBrowser products={products} locale={lang} t={t} subs={[...dept.subs]} />
        </Suspense>
      ) : (
        <EmptyCatalog text={t.shop.noProducts} hint={t.shop.noProductsHint} cta={t.shop.browseWhatsapp} />
      )}
    </div>
  );
}
