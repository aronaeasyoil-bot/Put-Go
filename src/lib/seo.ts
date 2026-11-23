import type { Metadata } from "next";
import { locales, localeTags, type Locale } from "@/i18n/config";
import { siteUrl } from "./site";

/** Canonical URL + hreflang alternates for a path (without the locale prefix). */
export function pageMetadata(locale: Locale, path: string): Pick<Metadata, "alternates"> {
  const base = siteUrl();
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeTags[l]] = `${base}/${l}${path}`;
  languages["x-default"] = `${base}/fr${path}`;
  return { alternates: { canonical: `${base}/${locale}${path}`, languages } };
}
