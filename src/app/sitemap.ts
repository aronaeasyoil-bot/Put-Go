import type { MetadataRoute } from "next";
import { locales, localeTags } from "@/i18n/config";
import { departments } from "@/lib/catalog-structure";
import { infoSlugs } from "@/content/pages";
import { searchProducts } from "@/lib/shopify";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}/fr${path}`,
    changeFrequency: "weekly",
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [localeTags[l], `${base}/${l}${path}`])) },
  });
  const products = await searchProducts("fr", { first: 250, sort: "new" });
  return [
    entry("", 1),
    ...departments.map((d) => entry(`/shop/${d.key}`, 0.8)),
    ...products.map((p) => ({ ...entry(`/products/${p.handle}`, 0.7), lastModified: p.updatedAt })),
    ...infoSlugs.map((s) => entry(`/${s}`, 0.3)),
  ];
}
