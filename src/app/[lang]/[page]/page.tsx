import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale, locales } from "@/i18n/config";
import { infoPages, infoSlugs, isInfoSlug } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => infoSlugs.map((page) => ({ lang, page })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[page]">): Promise<Metadata> {
  const { lang, page } = await params;
  if (!hasLocale(lang) || !isInfoSlug(page)) return {};
  const c = infoPages[lang][page];
  return { title: c.title, description: c.intro ?? c.title, ...pageMetadata(lang, `/${page}`) };
}

export default async function InfoPage({ params }: PageProps<"/[lang]/[page]">) {
  const { lang, page } = await params;
  if (!hasLocale(lang) || !isInfoSlug(page)) notFound();
  const t = getDictionary(lang);
  const c = infoPages[lang][page];
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      <h1 className="font-display text-4xl sm:text-5xl">{c.title}</h1>
      <div className="gold-rule my-8" />
      {c.intro && <p className="mb-8 text-stone">{c.intro}</p>}
      {c.pending && <p className="mb-8 border-s-2 border-gold bg-cream p-4 text-sm">{t.pages.pendingPolicy}</p>}
      <div className="space-y-10">
        {c.blocks.map((b, i) => (
          <section key={i}>
            {b.h && <h2 className="mb-3 font-display text-2xl">{b.h}</h2>}
            {b.p?.map((p, j) => <p key={j} className="mb-3 text-sm leading-relaxed text-ink/80">{p}</p>)}
            {b.list && (
              <ul className="list-disc space-y-1.5 ps-5 text-sm text-ink/80">
                {b.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
            {b.table && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse text-sm">
                  <thead>
                    <tr>{b.table.head.map((h) => <th key={h} className="border-b border-ink py-2 pe-4 text-start font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.table.rows.map((r, k) => (
                      <tr key={k}>{r.map((cell, m) => <td key={m} className="border-b border-line py-2 pe-4">{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
      <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-12 inline-flex items-center gap-2 bg-[#25D366] px-5 py-3 text-sm text-white">
        <WhatsAppIcon className="h-5 w-5" /> {t.common.whatsappUs}
      </a>
    </article>
  );
}
