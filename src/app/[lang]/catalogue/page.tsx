import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { catalogueText } from "@/content/catalogue";
import { CatalogueGrid } from "@/components/catalogue-grid";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/catalogue">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = catalogueText[lang];
  return { title: t.title, description: t.intro, ...pageMetadata(lang, "/catalogue") };
}

export default async function CataloguePage({ params }: PageProps<"/[lang]/catalogue">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = catalogueText[lang];
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-14">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="eyebrow mb-4 text-gold-deep">{t.kicker}</p>
        <h1 className="font-display text-5xl sm:text-6xl">{t.title}</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone">{t.intro}</p>
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-ink-soft">
          <WhatsAppIcon className="h-4 w-4" /> {t.order}
        </a>
      </div>
      <CatalogueGrid locale={lang} />
    </div>
  );
}
