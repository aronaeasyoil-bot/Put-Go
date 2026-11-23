import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { SITE } from "@/lib/site";
import { CountrySelect } from "./country-select";
import { InstagramIcon, WhatsAppIcon } from "./icons";

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const L = (p: string) => `/${locale}${p}`;
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: t.footer.shop,
      links: [
        [t.nav.women, L("/shop/women")],
        [t.nav.men, L("/shop/men")],
        [t.nav.kids, L("/shop/kids")],
        [t.nav.shoes, L("/shop/shoes")],
        [t.nav.accessories, L("/shop/accessories")],
        [t.nav["new-arrivals"], L("/shop/new-arrivals")],
        [t.nav.sale, L("/shop/sale")],
      ],
    },
    {
      title: t.footer.help,
      links: [
        [t.footer.contact, L("/contact")],
        [t.footer.faq, L("/faq")],
        [t.footer.sizeGuide, L("/size-guide")],
        [t.footer.shipping, L("/shipping")],
        [t.footer.returns, L("/returns")],
        [t.footer.payments, L("/payments")],
      ],
    },
    {
      title: t.footer.legal,
      links: [
        [t.footer.about, L("/about")],
        [t.footer.terms, L("/terms")],
        [t.footer.privacy, L("/privacy")],
        [t.footer.cookies, L("/cookies")],
      ],
    },
  ];
  return (
    <footer className="bg-ink text-white">
      <div className="gold-rule" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="space-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logoCrop} alt="PUT & GO" width={360} height={480} className="h-24 w-auto mix-blend-lighten" loading="lazy" />
          <p className="max-w-xs text-sm text-white/60">{t.footer.shipsFrom}</p>
          <div className="flex gap-3">
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center border border-white/20 hover:border-gold hover:text-gold"><WhatsAppIcon className="h-5 w-5" /></a>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center border border-white/20 hover:border-gold hover:text-gold"><InstagramIcon className="h-5 w-5" /></a>
          </div>
          <p className="text-sm text-white/70" dir="ltr">{SITE.whatsappDisplay}</p>
          <CountrySelect locale={locale} label={t.common.country} />
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="eyebrow mb-4 text-gold">{c.title}</h2>
            <ul className="space-y-2.5 text-sm text-white/70">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
              {c.title === t.footer.help && (
                <li><a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">{t.common.whatsappCatalog}</a></li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} PUT & GO. {t.footer.rights}</span>
          <span>Dakar · Sénégal</span>
        </div>
      </div>
    </footer>
  );
}
