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
import { Photo } from "@/components/photo";
import { CatalogueGrid } from "@/components/catalogue-grid";
import { departmentPhoto } from "@/lib/editorial";

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

  const photo = departmentPhoto[category];
  return (
    <>
      <section className="relative isolate flex h-[46svh] min-h-[320px] items-end overflow-hidden bg-ink text-white sm:h-[56svh]">
        {photo && (
          <div className="absolute inset-0 -z-10">
            <Photo name={photo} priority position="50% 25%" />
          </div>
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 sm:pb-14">
          <nav aria-label="Breadcrumb" className="eyebrow mb-4 text-white/70">
            <a href={`/${lang}`} className="hover:text-gold-light">PUT &amp; GO</a> <span aria-hidden>/</span> <span className="text-white">{t.nav[category]}</span>
          </nav>
          <h1 className="reveal font-display text-5xl sm:text-7xl">{t.nav[category]}</h1>
        </div>
      </section>
      {dept.subs.length > 0 && (
        <nav aria-label={t.nav[category]} className="no-scrollbar overflow-x-auto border-b border-line bg-paper">
          <ul className="mx-auto flex max-w-7xl gap-7 whitespace-nowrap px-5 py-4">
            {dept.subs.map((s) => (
              <li key={s}>
                <a href={`/${lang}/shop/${category}?sub=${s}`} className="eyebrow text-ink/70 transition-colors hover:text-gold-deep">{t.sub[s as keyof typeof t.sub] ?? s}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-10">
        {products.length ? (
          <Suspense>
            <CatalogBrowser products={products} locale={lang} t={t} subs={[...dept.subs]} />
          </Suspense>
        ) : ["men", "new-arrivals", "collections"].includes(category) ? (
          <CatalogueGrid locale={lang} />
        ) : (
          <EmptyCatalog text={t.shop.noProducts} hint={t.shop.noProductsHint} cta={t.shop.browseWhatsapp} />
        )}
      </div>
    </>
  );
}
