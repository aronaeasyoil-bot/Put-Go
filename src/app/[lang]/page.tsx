import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { getCollectionProducts } from "@/lib/shopify";
import { getInstagramMedia } from "@/lib/instagram";
import { SITE } from "@/lib/site";
import { EditorialPanel } from "@/components/editorial-panel";
import { ProductRail, SectionHeading } from "@/components/product-rail";
import { ShopifyImage } from "@/components/shopify-image";
import { EmptyCatalog } from "@/components/empty-catalog";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";

// Products and Instagram media are read live from Shopify / Instagram on each request.
export const dynamic = "force-dynamic";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const L = (p: string) => `/${lang}${p}`;

  const [newArrivals, bestSellers, trending, shoes, accessories, insta] = await Promise.all([
    getCollectionProducts("new-arrivals", lang, { first: 8, sort: "new" }),
    getCollectionProducts("best-sellers", lang, { first: 8 }),
    getCollectionProducts("trending", lang, { first: 8 }),
    getCollectionProducts("shoes", lang, { first: 4 }),
    getCollectionProducts("accessories", lang, { first: 4 }),
    getInstagramMedia(8),
  ]);
  const empty = <EmptyCatalog text={t.home.emptyCatalog} cta={t.common.whatsappCatalog} />;
  const heroVideo = process.env.HERO_VIDEO_URL;
  const heroImage = process.env.HERO_IMAGE_URL;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {heroVideo ? (
          <video className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" src={heroVideo} autoPlay muted loop playsInline poster={heroImage} />
        ) : heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        ) : (
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_70%_40%,#2b2316_0%,#0b0b0b_70%)]" />
        )}
        <div className="mx-auto grid min-h-[calc(100svh-110px)] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div className="reveal order-2 md:order-1">
            <p className="eyebrow mb-5 text-gold">{t.home.heroKicker}</p>
            <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              <span className="gold-text">PUT &amp; GO</span>
              <span className="mt-2 block text-3xl text-white/90 sm:text-4xl lg:text-5xl" dir="ltr">Style for Every Generation</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-white/70">{t.home.heroText}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={L("/shop/new-arrivals")} className="bg-gold px-7 py-3.5 text-sm uppercase tracking-wider text-ink hover:bg-gold-light">{t.home.newArrivals}</Link>
              <Link href={L("/shop/women")} className="border border-white/40 px-7 py-3.5 text-sm uppercase tracking-wider hover:border-gold hover:text-gold">{t.common.shopNow}</Link>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logo} alt="PUT & GO" width={1080} height={1080} fetchPriority="high" className="reveal w-[70%] max-w-[460px] mix-blend-lighten md:w-full" />
          </div>
        </div>
      </section>

      {/* Shop Women / Men / Kids */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20" aria-label={t.nav.collections}>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {([
            ["women", t.home.shopWomen, "noir"],
            ["men", t.home.shopMen, "sand"],
            ["kids", t.home.shopKids, "ivory"],
          ] as const).map(([key, label, tone]) => (
            <Link key={key} href={L(`/shop/${key}`)} className="group block">
              <EditorialPanel tone={tone} label={t.common.editorialPlaceholder} title={label} className="aspect-[4/5] transition-transform duration-500 group-hover:scale-[0.99]">
                <p className="eyebrow opacity-70">{t.nav[key]}</p>
                <p className="mt-2 font-display text-4xl">{label}</p>
                <span className="eyebrow mt-4 inline-block border-b border-current pb-1">{t.common.shopNow}</span>
              </EditorialPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <SectionHeading kicker={t.nav["new-arrivals"]} title={t.home.newArrivals} text={t.home.newArrivalsText} href={L("/shop/new-arrivals")} cta={t.common.viewAll} />
        <ProductRail products={newArrivals} locale={lang} t={t} empty={empty} />
      </section>

      {/* Featured collections */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading title={t.home.featured} text={t.home.featuredText} href={L("/shop/collections")} cta={t.common.viewAll} />
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <Link href={L("/shop/collections")} className="block">
              <EditorialPanel tone="noir" label={t.common.editorialPlaceholder} title={t.home.collectionCeremony} className="aspect-[4/3] md:aspect-auto md:h-full">
                <p className="font-display text-4xl sm:text-5xl">{t.home.collectionCeremony}</p>
              </EditorialPanel>
            </Link>
            <div className="grid gap-4">
              <Link href={L("/shop/women?sub=traditional")} className="block">
                <EditorialPanel tone="gold" label={t.common.editorialPlaceholder} title={t.home.collectionTraditional} className="aspect-[16/9]">
                  <p className="font-display text-3xl">{t.home.collectionTraditional}</p>
                </EditorialPanel>
              </Link>
              <Link href={L("/shop/new-arrivals")} className="block">
                <EditorialPanel tone="ivory" label={t.common.editorialPlaceholder} title={t.home.collectionEveryday} className="aspect-[16/9]">
                  <p className="font-display text-3xl">{t.home.collectionEveryday}</p>
                </EditorialPanel>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading title={t.home.bestSellers} href={L("/shop/best-sellers")} cta={t.common.viewAll} />
        <ProductRail products={bestSellers} locale={lang} t={t} empty={empty} />
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <SectionHeading title={t.home.trending} text={t.home.trendingText} />
        <ProductRail products={trending} locale={lang} t={t} empty={empty} />
      </section>

      {/* Shoes & accessories */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl sm:text-4xl">{t.home.shoesAccessories}</h2>
            <p className="mt-2 text-sm text-white/60">{t.home.shoesAccessoriesText}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["shoes", shoes, "sand"],
              ["accessories", accessories, "gold"],
            ] as const).map(([key, list, tone]) => (
              <Link key={key} href={L(`/shop/${key}`)} className="group block">
                {list[0]?.featuredImage ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink-soft">
                    <ShopifyImage image={list[0].featuredImage} alt={list[0].title} sizes="(min-width: 640px) 50vw, 100vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <p className="absolute bottom-5 start-5 font-display text-3xl">{t.nav[key]}</p>
                  </div>
                ) : (
                  <EditorialPanel tone={tone} label={t.common.editorialPlaceholder} title={t.nav[key]} className="aspect-[4/3]">
                    <p className="font-display text-4xl">{t.nav[key]}</p>
                  </EditorialPanel>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal offers */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="relative overflow-hidden border border-gold/50 bg-paper px-6 py-12 text-center sm:px-16">
          <p className="eyebrow text-gold-deep">{t.nav.sale}</p>
          <h2 className="mt-3 font-display text-4xl">{t.home.seasonal}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-stone">{t.home.seasonalText}</p>
          <Link href={L("/shop/sale")} className="mt-7 inline-block bg-ink px-7 py-3.5 text-sm uppercase tracking-wider text-white hover:bg-ink-soft">{t.home.seasonalCta}</Link>
        </div>
      </section>

      {/* Instagram */}
      <section className="bg-cream py-20" aria-labelledby="ig-title">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow mb-2 text-gold-deep">{SITE.instagramHandle}</p>
              <h2 id="ig-title" className="font-display text-3xl uppercase tracking-wide sm:text-4xl">{t.home.instagramTitle}</h2>
              {!insta.length && <p className="mt-2 text-sm text-stone">{t.home.instagramText}</p>}
            </div>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 border border-ink px-5 py-3 text-sm hover:bg-ink hover:text-white">
              <InstagramIcon className="h-5 w-5" />
              {t.home.instagramFollow}
            </a>
          </div>
          {insta.length ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {insta.map((m) => (
                <li key={m.id}>
                  <a href={m.permalink} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden bg-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url} alt={m.caption?.slice(0, 120) || "PUT & GO Instagram"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {m.media_type === "VIDEO" && <span className="absolute end-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[0.6rem] text-white">▶ Reel</span>}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-hidden>
              {(["noir", "sand", "ivory", "gold"] as const).map((tone) => (
                <li key={tone}>
                  <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                    <EditorialPanel tone={tone} label={t.common.editorialPlaceholder} className="aspect-square">
                      <InstagramIcon className="h-7 w-7 opacity-60" />
                    </EditorialPanel>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Delivery + About */}
      <section className="mx-auto grid max-w-7xl gap-px bg-line px-0 sm:my-20 md:grid-cols-2">
        <div className="bg-paper px-6 py-14 sm:px-12">
          <p className="eyebrow text-gold-deep">{t.footer.shipsFrom}</p>
          <h2 className="mt-3 font-display text-3xl">{t.home.deliveryTitle}</h2>
          <p className="mt-4 text-sm text-stone">{t.home.deliveryText}</p>
          <p className="mt-4 text-sm">{t.home.deliveryZones}</p>
          <Link href={L("/shipping")} className="eyebrow mt-6 inline-block border-b border-ink pb-1">{t.home.deliveryCta}</Link>
        </div>
        <div className="bg-paper px-6 py-14 sm:px-12">
          <p className="eyebrow text-gold-deep">PUT &amp; GO</p>
          <h2 className="mt-3 font-display text-3xl">{t.home.aboutTitle}</h2>
          <p className="mt-4 text-sm text-stone">{t.home.aboutText}</p>
          <Link href={L("/about")} className="eyebrow mt-6 inline-block border-b border-ink pb-1">{t.home.aboutCta}</Link>
        </div>
      </section>

      {/* Newsletter + WhatsApp */}
      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl">{t.home.newsletterTitle}</h2>
            <p className="mb-6 mt-2 text-sm text-white/60">{t.home.newsletterText}</p>
            <NewsletterForm t={t.newsletter} />
          </div>
          <div>
            <h2 className="font-display text-3xl">{t.home.assistanceTitle}</h2>
            <p className="mt-2 text-sm text-white/60">{t.home.assistanceText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] px-5 py-3 text-sm text-white">
                <WhatsAppIcon className="h-5 w-5" />
                <span dir="ltr">{SITE.whatsappDisplay}</span>
              </a>
              <a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-sm hover:border-gold hover:text-gold">
                {t.common.whatsappCatalog}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
