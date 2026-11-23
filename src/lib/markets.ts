/**
 * Country selector. Prices are never converted locally: when Shopify Markets
 * is configured, the Storefront API returns presentment prices for the
 * selected country via @inContext. Otherwise the store's base currency is shown.
 */
export const markets = [
  { code: "SN", currency: "XOF", label: { fr: "Sénégal", en: "Senegal", ar: "السنغال" } },
  { code: "CI", currency: "XOF", label: { fr: "Côte d’Ivoire", en: "Côte d’Ivoire", ar: "ساحل العاج" } },
  { code: "ML", currency: "XOF", label: { fr: "Mali", en: "Mali", ar: "مالي" } },
  { code: "FR", currency: "EUR", label: { fr: "France", en: "France", ar: "فرنسا" } },
  { code: "BE", currency: "EUR", label: { fr: "Belgique", en: "Belgium", ar: "بلجيكا" } },
  { code: "IT", currency: "EUR", label: { fr: "Italie", en: "Italy", ar: "إيطاليا" } },
  { code: "ES", currency: "EUR", label: { fr: "Espagne", en: "Spain", ar: "إسبانيا" } },
  { code: "AE", currency: "AED", label: { fr: "Émirats arabes unis", en: "United Arab Emirates", ar: "الإمارات" } },
  { code: "US", currency: "USD", label: { fr: "États-Unis", en: "United States", ar: "الولايات المتحدة" } },
] as const;

export type CountryCode = (typeof markets)[number]["code"];
export const defaultCountry: CountryCode = "SN";
export const COUNTRY_COOKIE = "pg_country";

export function isCountry(value: string | undefined): value is CountryCode {
  return !!value && markets.some((m) => m.code === value);
}
