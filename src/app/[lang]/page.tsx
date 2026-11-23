import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { getCollectionProducts } from "@/lib/shopify";
import { getInstagramMedia } from "@/lib/instagram";
import { SITE } from "@/lib/site";
import type { PhotoKey } from "@/lib/editorial";
import { Photo } from "@/components/photo";
import { ProductRail } from "@/components/product-rail";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";

// Products and Instagram media are read live on each request.
export const dynamic = "force-dynamic";

function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow mb-4 ${light ? "text-gold-light" : "text-gold-deep"}`}>{children}</p>;
}

function CtaLink({ href, children, light }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`eyebrow group inline-flex items-center gap-3 border-b pb-1.5 transition-colors ${light ? "border-white/70 text-white hover:border-gold hover:text-gold-light" : "border-ink hover:border-gold-deep hover:text-gold-deep"}`}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
    </Link>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const L = (p: string) => `/${lang}${p}`;

  const [newArrivals, bestSellers, insta] = await Promise.all([
    getCollectionProducts("new-arrivals", lang, { first: 8, sort: "new" }),
    getCollectionProducts("best-sellers", lang, { first: 8 }),
    getInstagramMedia(8),
  ]);
  const heroVideo = process.env.HERO_VIDEO_URL;
  const heroImage = process.env.HERO_IMAGE_URL;

  const departments: { key: "women" | "men" | "kids"; photo: PhotoKey; pos?: string }[] = [
    { key: "women", photo: "women", pos: "50% 20%" },
    { key: "men", photo: "men", pos: "50% 15%" },
    { key: "kids", photo: "kids", pos: "50% 25%" },
  ];

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative isolate h-[calc(100svh-104px)] min-h-[560px] overflow-hidden bg-ink text-white lg:h-[calc(100svh-150px)]">
        {heroVideo ? (
          <video className="absolute inset-0 -z-10 h-full w-full object-cover" src={heroVideo} autoPlay muted loop playsInline poster={heroImage} />
        ) : heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-10">
            <Photo name="hero" priority position="65% 30%" className="scale-105 animate-[heroZoom_14s_ease-out_forwards]" />
          </div>
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 sm:pb-20">
          <div className="reveal max-w-2xl">
            <Kicker light>{t.home.heroKicker}</Kicker>
            <h1 className="font-display text-[2.9rem] leading-[0.95] sm:text-7xl lg:text-8xl">
              PUT &amp; GO
              <span className="mt-3 block font-sans text-lg font-light uppercase tracking-[0.35em] text-white/90 sm:text-2xl" dir="ltr">
                Style for Every Generation
              </span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{t.home.heroText}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={L("/shop/new-arrivals")} className="bg-white px-8 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light">
                {t.home.newArrivals}
              </Link>
              <Link href={L("/shop/women")} className="border border-white/70 px-8 py-4 text-xs uppercase tracking-[0.2em] transition-colors hover:border-gold-light hover:text-gold-light">
                {t.common.shopNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Women / Men / Kids */}
      <section aria-label={t.nav.collections} className="grid gap-1 bg-white pt-1 sm:grid-cols-3">
        {departments.map((d) => (
          <Link key={d.key} href={L(`/shop/${d.key}`)} className="group relative block aspect-[3/4] overflow-hidden bg-cream sm:aspect-[2/3]">
            <Photo name={d.photo} sizes="(min-width: 640px) 33vw, 100vw" ratio={1.5} position={d.pos} className="transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="font-display text-5xl sm:text-6xl">{t.nav[d.key]}</p>
              <span className="eyebrow mt-4 inline-block border-b border-white/70 pb-1 transition-colors group-hover:border-gold-light group-hover:text-gold-light">{t.common.shopNow}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* 3 — New arrivals */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="mb-10 flex flex-col items-center text-center">
          <Kicker>{t.nav["new-arrivals"]}</Kicker>
          <h2 className="font-display text-4xl sm:text-5xl">{t.home.newArrivals}</h2>
          <p className="mt-3 max-w-md text-sm text-stone">{t.home.newArrivalsText}</p>
        </div>
        <ProductRail
          products={newArrivals}
          locale={lang}
          t={t}
          empty={
            <div className="grid gap-1 sm:grid-cols-4">
              {(["women2", "menCity", "traditional2", "men2"] as PhotoKey[]).map((k, i) => (
                <div key={k} className={`relative aspect-[3/4] overflow-hidden bg-cream ${i > 1 ? "hidden sm:block" : ""}`}>
                  <Photo name={k} sizes="(min-width: 640px) 25vw, 50vw" ratio={1.33} position="50% 20%" />
                </div>
              ))}
              <div className="flex flex-col items-center gap-4 bg-cream px-6 py-8 text-center sm:col-span-4">
                <p className="max-w-xl text-sm text-ink/80">{t.home.emptyCatalog}</p>
                <a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-xs uppercase tracking-[0.2em] text-white hover:bg-ink-soft">
                  <WhatsAppIcon className="h-4 w-4" /> {t.common.whatsappCatalog}
                </a>
              </div>
            </div>
          }
        />
        {newArrivals.length > 0 && (
          <div className="mt-12 text-center"><CtaLink href={L("/shop/new-arrivals")}>{t.common.viewAll}</CtaLink></div>
        )}
      </section>

      {/* 4 — Editorial: ceremonies */}
      <section className="grid bg-ink text-white lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[760px]">
          <Photo name="ceremony" sizes="(min-width: 1024px) 50vw, 100vw" position="50% 25%" />
        </div>
        <div className="flex flex-col justify-center px-6 py-16 sm:px-16 lg:px-20">
          <Kicker light>{t.home.featured}</Kicker>
          <h2 className="font-display text-4xl leading-tight sm:text-6xl">{t.home.collectionCeremony}</h2>
          <div className="gold-rule my-8 w-24" />
          <p className="max-w-md text-sm leading-relaxed text-white/70">{t.home.featuredText}</p>
          <div className="mt-10"><CtaLink href={L("/shop/collections")} light>{t.common.shopNow}</CtaLink></div>
        </div>
      </section>

      {/* 5 — Collections */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Kicker>{t.nav.collections}</Kicker>
            <h2 className="font-display text-4xl sm:text-5xl">{t.home.featured}</h2>
          </div>
          <CtaLink href={L("/shop/collections")}>{t.common.viewAll}</CtaLink>
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          {([
            ["traditional", t.home.collectionTraditional, "/shop/women?sub=traditional", "md:col-span-7 aspect-[4/5] md:aspect-auto md:h-[680px]", "50% 20%"],
            ["menCasual", t.home.collectionEveryday, "/shop/men", "md:col-span-5 aspect-[4/5] md:aspect-auto md:h-[680px]", "50% 15%"],
          ] as [PhotoKey, string, string, string, string][]).map(([photo, label, href, cls, pos]) => (
            <Link key={photo} href={L(href)} className={`group relative block overflow-hidden bg-cream ${cls}`}>
              <Photo name={photo} sizes="(min-width: 768px) 55vw, 100vw" position={pos} className="transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-7 text-white">
                <p className="font-display text-3xl sm:text-4xl">{label}</p>
                <span className="eyebrow mt-3 inline-block border-b border-white/70 pb-1">{t.common.shopNow}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 — Best sellers (only when real products exist) */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-4xl">{t.home.bestSellers}</h2>
            <CtaLink href={L("/shop/best-sellers")}>{t.common.viewAll}</CtaLink>
          </div>
          <ProductRail products={bestSellers} locale={lang} t={t} />
        </section>
      )}

      {/* 7 — Shoes & accessories */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 text-center">
            <Kicker>{t.home.trending}</Kicker>
            <h2 className="font-display text-4xl sm:text-5xl">{t.home.shoesAccessories}</h2>
            <p className="mt-3 text-sm text-stone">{t.home.shoesAccessoriesText}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {([
              ["shoes", t.nav.shoes, "/shop/shoes"],
              ["bag", t.sub.handbags, "/shop/accessories?sub=handbags"],
              ["shoes2", t.nav.men + " · " + t.nav.shoes, "/shop/men?sub=shoes"],
              ["jewelry", t.nav.accessories, "/shop/accessories"],
            ] as [PhotoKey, string, string][]).map(([photo, label, href]) => (
              <Link key={photo} href={L(href)} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Photo name={photo} sizes="(min-width: 1024px) 25vw, 50vw" ratio={1.33} className="transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-4 text-center group-hover:text-gold-deep">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8 — Seasonal offers */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 opacity-60">
          <Photo name="women3" position="50% 30%" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/50 to-transparent rtl:bg-gradient-to-l" />
        <div className="mx-auto max-w-7xl px-5 py-24 sm:py-32">
          <div className="max-w-lg">
            <Kicker light>{t.nav.sale}</Kicker>
            <h2 className="font-display text-5xl sm:text-6xl">{t.home.seasonal}</h2>
            <p className="mt-5 text-sm leading-relaxed text-white/75">{t.home.seasonalText}</p>
            <div className="mt-10"><CtaLink href={L("/shop/sale")} light>{t.home.seasonalCta}</CtaLink></div>
          </div>
        </div>
      </section>

      {/* 9 — Instagram */}
      <section className="py-20 sm:py-28" aria-labelledby="ig-title">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-10 flex flex-col items-center text-center">
            <InstagramIcon className="mb-4 h-7 w-7 text-gold-deep" />
            <h2 id="ig-title" className="font-display text-4xl sm:text-5xl">{t.home.instagramTitle}</h2>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="eyebrow mt-4 text-gold-deep hover:underline">{SITE.instagramHandle}</a>
          </div>
          {insta.length ? (
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {insta.map((m) => (
                <li key={m.id}>
                  <a href={m.permalink} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url} alt={m.caption?.slice(0, 120) || "PUT & GO Instagram"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {m.media_type === "VIDEO" && <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] text-white">▶ Reel</span>}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <p className="max-w-xl text-sm text-stone">{t.home.instagramText}</p>
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-ink hover:text-white">
                <InstagramIcon className="h-4 w-4" /> {t.home.instagramFollow}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 10 — Services strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
          {[
            [t.home.deliveryTitle, t.home.deliveryZones, L("/shipping"), t.home.deliveryCta],
            [t.home.assistanceTitle, SITE.whatsappDisplay, SITE.whatsappUrl, t.common.whatsappUs],
            [t.footer.payments, t.cart.checkoutNote, L("/payments"), t.footer.payments],
          ].map(([title, text, href, cta]) => (
            <div key={title} className="px-2 py-10 text-center sm:px-8">
              <h3 className="eyebrow mb-3">{title}</h3>
              <p className="mx-auto max-w-xs text-sm text-stone" dir={text === SITE.whatsappDisplay ? "ltr" : undefined}>{text}</p>
              <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-4 inline-block text-xs uppercase tracking-[0.18em] underline underline-offset-4 hover:text-gold-deep">{cta}</a>
            </div>
          ))}
        </div>
      </section>

      {/* 11 — About */}
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-20 sm:px-16 lg:order-2 lg:px-20">
          <Kicker>PUT &amp; GO</Kicker>
          <h2 className="font-display text-4xl sm:text-5xl">{t.home.aboutTitle}</h2>
          <div className="gold-rule my-8 w-24" />
          <p className="max-w-md text-sm leading-relaxed text-ink/75">{t.home.aboutText}</p>
          <div className="mt-10"><CtaLink href={L("/about")}>{t.home.aboutCta}</CtaLink></div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden lg:order-1 lg:aspect-auto lg:min-h-[620px]">
          <Photo name="traditional2" sizes="(min-width: 1024px) 50vw, 100vw" position="50% 30%" />
        </div>
      </section>

      {/* 12 — Newsletter + WhatsApp */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl">{t.home.newsletterTitle}</h2>
            <p className="mb-8 mt-3 text-sm text-white/60">{t.home.newsletterText}</p>
            <NewsletterForm t={t.newsletter} />
          </div>
          <div>
            <h2 className="font-display text-4xl">{t.home.assistanceTitle}</h2>
            <p className="mt-3 text-sm text-white/60">{t.home.assistanceText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] px-6 py-3.5 text-sm text-white">
                <WhatsAppIcon className="h-5 w-5" />
                <span dir="ltr">{SITE.whatsappDisplay}</span>
              </a>
              <a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/40 px-6 py-3.5 text-sm hover:border-gold hover:text-gold">
                {t.common.whatsappCatalog}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
