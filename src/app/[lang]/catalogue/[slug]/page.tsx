/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { catalogue, catalogueImage, catalogueText, getCatalogueItem, kindText, madeToMeasure } from "@/content/catalogue";
import { CatalogueCard, PriceButton } from "@/components/catalogue-grid";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { productEnquiryLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((lang) => catalogue.map((i) => ({ lang, slug: i.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/catalogue/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = getCatalogueItem(slug);
  if (!hasLocale(lang) || !item) return {};
  return {
    title: item.name[lang],
    description: `${item.name[lang]} — ${kindText[item.kind][lang]}`,
    openGraph: { images: [catalogueImage(item.images[0])] },
    ...pageMetadata(lang, `/catalogue/${slug}`),
  };
}

export default async function CatalogueItemPage({ params }: PageProps<"/[lang]/catalogue/[slug]">) {
  const { lang, slug } = await params;
  const item = getCatalogueItem(slug);
  if (!hasLocale(lang) || !item) notFound();
  const t = catalogueText[lang];
  const name = item.name[lang];
  const url = `${siteUrl()}/${lang}/catalogue/${slug}`;
  const others = catalogue.filter((i) => i.slug !== slug).slice(0, 4);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone">
        <Link href={`/${lang}`} className="hover:underline">PUT &amp; GO</Link> / <Link href={`/${lang}/catalogue`} className="hover:underline">{t.title}</Link> / <span className="text-ink">{name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="grid gap-2">
          {item.images.map((img, i) => (
            <div key={img} className="overflow-hidden bg-cream">
              <img src={catalogueImage(img)} alt={i === 0 ? name : ""} className="w-full" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="lg:sticky lg:top-40 lg:self-start">
          <p className="eyebrow mb-3 text-gold-deep">{t.men}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{name}</h1>
          <div className="mt-6"><PriceButton item={item} locale={lang} large /></div>
          <div className="gold-rule my-8 w-24" />
          <p className="max-w-md text-[0.95rem] leading-relaxed text-ink/80">{kindText[item.kind][lang]}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">{madeToMeasure[lang]}</p>
          <a href={productEnquiryLink(lang, name, url)} target="_blank" rel="noopener noreferrer" className="mt-8 flex w-full items-center justify-center gap-2 bg-[#25D366] px-6 py-4 text-sm uppercase tracking-[0.15em] text-white sm:w-auto sm:inline-flex">
            <WhatsAppIcon className="h-5 w-5" /> {t.order}
          </a>
          <div className="mt-6"><Link href={`/${lang}/catalogue`} className="eyebrow border-b border-ink pb-1 hover:text-gold-deep">{t.back}</Link></div>
        </div>
      </div>
      <section className="mt-24">
        <h2 className="mb-8 font-display text-3xl">{lang === "fr" ? "Vous aimerez aussi" : lang === "en" ? "You may also like" : "قد يعجبك أيضًا"}</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {others.map((o) => <CatalogueCard key={o.slug} item={o} locale={lang} />)}
        </div>
      </section>
    </div>
  );
}
