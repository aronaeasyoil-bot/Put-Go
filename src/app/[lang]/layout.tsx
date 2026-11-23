import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Jost, Noto_Kufi_Arabic } from "next/font/google";
import "../globals.css";
import { dirFor, hasLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { CookieConsent } from "@/components/cookie-consent";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cormorant", display: "swap" });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-kufi", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: "%s · PUT & GO" },
    description: t.meta.description,
    applicationName: "PUT & GO",
    ...pageMetadata(lang, ""),
    openGraph: {
      type: "website",
      siteName: "PUT & GO",
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "fr" ? "fr_SN" : lang === "ar" ? "ar_AE" : "en_US",
      images: [{ url: "/brand/put-and-go-logo.jpg", width: 1080, height: 1080, alt: "PUT & GO" }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/brand/put-and-go-logo.jpg"] },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  const t = getDictionary(locale);
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "PUT & GO",
    url: siteUrl(),
    logo: `${siteUrl()}/brand/put-and-go-logo.jpg`,
    telephone: "+221776601327",
    address: { "@type": "PostalAddress", addressLocality: "Dakar", addressCountry: "SN" },
    sameAs: ["https://www.instagram.com/put_and_go_officiel/"],
  };
  return (
    <html lang={locale} dir={dirFor(locale)} className={`${jost.variable} ${cormorant.variable} ${kufi.variable}`}>
      <body className="min-h-screen">
        <Providers>
          <Header locale={locale} t={t} />
          <main id="main">{children}</main>
          <Footer locale={locale} t={t} />
          <WhatsAppFloat label={t.common.whatsappUs} />
          <CookieConsent locale={locale} t={t.cookies} analyticsToken={process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN} />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </body>
    </html>
  );
}
