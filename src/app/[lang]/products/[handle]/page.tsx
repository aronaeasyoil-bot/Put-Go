import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { getProduct, getRecommendations } from "@/lib/shopify";
import { productEnquiryLink } from "@/lib/whatsapp";
import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { ProductGallery } from "@/components/product-gallery";
import { ProductForm } from "@/components/product-form";
import { ProductRail, SectionHeading } from "@/components/product-rail";

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[handle]">): Promise<Metadata> {
  const { lang, handle } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProduct(handle, lang);
  if (!product) return { title: getDictionary(lang).product.notFound, robots: { index: false } };
  const img = product.featuredImage;
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description.slice(0, 160),
    ...pageMetadata(lang, `/products/${handle}`),
    openGraph: img ? { images: [{ url: img.url, width: img.width ?? undefined, height: img.height ?? undefined, alt: img.altText ?? product.title }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[handle]">) {
  const { lang, handle } = await params;
  if (!hasLocale(lang)) notFound();
  const product = await getProduct(handle, lang);
  if (!product) notFound();
  const t = getDictionary(lang);
  const related = await getRecommendations(product.id, lang);
  const url = `${siteUrl()}/${lang}/products/${product.handle}`;
  const media = product.media.length ? product.media : product.images.map((image) => ({ mediaContentType: "IMAGE" as const, image }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "PUT & GO" },
    url,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.id.split("/").pop(),
      price: v.price.amount,
      priceCurrency: v.price.currencyCode,
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-stone">
        <Link href={`/${lang}`} className="hover:underline">PUT &amp; GO</Link> / <span className="text-ink">{product.title}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
        <ProductGallery media={media} title={product.title} />
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-6">
            <ProductForm product={product} locale={lang} t={t} whatsappHref={productEnquiryLink(lang, product.title, url)} />
          </div>
          <div className="mt-8 divide-y divide-line border-y border-line text-sm">
            {product.descriptionHtml && (
              <details open className="py-4">
                <summary className="eyebrow cursor-pointer list-none">{t.product.description}</summary>
                <div className="prose-sm mt-3 space-y-2 text-stone" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              </details>
            )}
            <details className="py-4">
              <summary className="eyebrow cursor-pointer list-none">{t.product.sizeGuide}</summary>
              <p className="mt-3 text-stone">{t.pages.sizeGuideIntro} <Link href={`/${lang}/size-guide`} className="underline">{t.product.sizeGuide}</Link></p>
            </details>
            <details className="py-4">
              <summary className="eyebrow cursor-pointer list-none">{t.product.shipping}</summary>
              <p className="mt-3 text-stone">{t.product.shippingText} <Link href={`/${lang}/shipping`} className="underline">{t.footer.shipping}</Link></p>
            </details>
            <details className="py-4">
              <summary className="eyebrow cursor-pointer list-none">{t.product.returns}</summary>
              <p className="mt-3 text-stone">{t.product.returnsText} <Link href={`/${lang}/returns`} className="underline">{t.footer.returns}</Link></p>
            </details>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading title={t.product.related} />
          <ProductRail products={related} locale={lang} t={t} />
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </div>
  );
}
