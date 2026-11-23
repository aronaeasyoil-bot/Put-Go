import { localeTags, type Locale } from "@/i18n/config";

export function formatMoney(amount: string | number, currencyCode: string, locale: Locale): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "";
  const zeroDecimal = currencyCode === "XOF" || currencyCode === "XAF";
  try {
    return new Intl.NumberFormat(localeTags[locale], {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currencyCode}`;
  }
}
