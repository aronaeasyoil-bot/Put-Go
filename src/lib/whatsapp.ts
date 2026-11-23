import { SITE } from "./site";
import type { Locale } from "@/i18n/config";

const templates: Record<Locale, (name: string, url: string) => string> = {
  fr: (n, u) =>
    `Bonjour PUT & GO, je suis intéressé(e) par ce produit : ${n}. Voici le lien : ${u}. Pouvez-vous confirmer sa disponibilité ?`,
  en: (n, u) =>
    `Hello PUT & GO, I am interested in this product: ${n}. Here is the link: ${u}. Can you confirm its availability?`,
  ar: (n, u) =>
    `مرحبًا PUT & GO، أنا مهتم(ة) بهذا المنتج: ${n}. هذا هو الرابط: ${u}. هل يمكنكم تأكيد توفره؟`,
};

/** Builds a wa.me deep link with a prefilled product enquiry. */
export function productEnquiryLink(locale: Locale, productName: string, productUrl: string): string {
  const text = templates[locale](productName, productUrl);
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function whatsappLink(text?: string): string {
  return text
    ? `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${SITE.whatsappNumber}`;
}
