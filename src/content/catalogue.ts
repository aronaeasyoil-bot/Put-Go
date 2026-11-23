import type { Locale } from "@/i18n/config";

/**
 * Pieces photographed by PUT & GO (photos supplied by the owner, 2026-11-23).
 * Prices are deliberately absent until the owner confirms them: the site shows
 * "Prix sur demande" and orders go through WhatsApp. Add `price` (XOF) only
 * from a confirmed source.
 */
export type CatalogueItem = {
  slug: string;
  name: Record<Locale, string>;
  images: string[];
  price?: number; // XOF, confirmed by the owner
};

const L = (fr: string, en: string, ar: string) => ({ fr, en, ar });

export const catalogue: CatalogueItem[] = [
  { slug: "ensemble-prune", name: L("Ensemble prune col zippé", "Plum zip-collar set", "طقم برقوقي بياقة بسحاب"), images: ["ensemble-prune"] },
  { slug: "tunique-beige-brodee", name: L("Tunique beige brodée", "Embroidered beige tunic", "قميص بيج مطرز"), images: ["tunique-beige-brodee"] },
  { slug: "djellaba-bleu-nuit", name: L("Djellaba bleu nuit", "Midnight blue djellaba", "جلابية كحلية"), images: ["djellaba-bleu-nuit"] },
  { slug: "ensemble-rouge-brode", name: L("Ensemble rouge brodé", "Embroidered red set", "طقم أحمر مطرز"), images: ["ensemble-rouge-brode"] },
  { slug: "grand-boubou-beige", name: L("Boubou long beige brodé", "Long embroidered beige kaftan", "قفطان بيج طويل مطرز"), images: ["grand-boubou-beige"] },
  { slug: "ensemble-vert-emeraude", name: L("Ensemble vert émeraude", "Emerald green set", "طقم أخضر زمردي"), images: ["ensemble-vert-emeraude"] },
  { slug: "tunique-gris-zippee", name: L("Tunique gris perle zippée", "Pearl grey zip tunic", "قميص رمادي بسحاب"), images: ["tunique-gris-zippee"] },
  { slug: "djellaba-marron", name: L("Djellaba marron col doré", "Brown djellaba, gold collar", "جلابية بنية بياقة ذهبية"), images: ["djellaba-marron", "djellaba-marron-2"] },
  { slug: "djellaba-lilas", name: L("Djellaba lilas brodée", "Embroidered lilac djellaba", "جلابية ليلكية مطرزة"), images: ["djellaba-lilas"] },
  { slug: "djellaba-blanche", name: L("Djellaba blanche à liseré", "White piped djellaba", "جلابية بيضاء بحواف"), images: ["djellaba-blanche"] },
  { slug: "tunique-terracotta", name: L("Tunique terracotta manches courtes", "Short-sleeve terracotta tunic", "قميص تيراكوتا بأكمام قصيرة"), images: ["tunique-terracotta"] },
  { slug: "ensemble-noir", name: L("Ensemble noir col montant", "Black stand-collar set", "طقم أسود بياقة مرتفعة"), images: ["ensemble-noir"] },
  { slug: "chemise-bleu-ciel", name: L("Chemise bleu ciel", "Sky blue shirt", "قميص أزرق سماوي"), images: ["chemise-bleu-ciel"] },
];

export const catalogueImage = (key: string) => `/catalogue/${key}.webp`;
export const getCatalogueItem = (slug: string) => catalogue.find((i) => i.slug === slug);

export const catalogueText: Record<Locale, { title: string; kicker: string; intro: string; priceOnRequest: string; order: string; men: string; back: string; howTo: string }> = {
  fr: {
    title: "La collection",
    kicker: "Homme · Pièces PUT & GO",
    intro: "Tenues traditionnelles et modernes confectionnées par PUT & GO à Dakar. Commandez directement sur WhatsApp : nous confirmons le prix, les tailles et la disponibilité.",
    priceOnRequest: "Prix sur demande",
    order: "Commander sur WhatsApp",
    men: "Homme",
    back: "Toute la collection",
    howTo: "Envoyez-nous le modèle sur WhatsApp : nous confirmons votre taille, le prix et le délai de livraison.",
  },
  en: {
    title: "The collection",
    kicker: "Men · PUT & GO pieces",
    intro: "Traditional and modern outfits made by PUT & GO in Dakar. Order directly on WhatsApp: we confirm price, sizes and availability.",
    priceOnRequest: "Price on request",
    order: "Order on WhatsApp",
    men: "Men",
    back: "Full collection",
    howTo: "Send us the model on WhatsApp: we confirm your size, the price and delivery time.",
  },
  ar: {
    title: "التشكيلة",
    kicker: "رجال · قطع PUT & GO",
    intro: "أزياء تقليدية وعصرية من تصميم PUT & GO في داكار. اطلبوا مباشرة عبر واتساب: نؤكد السعر والمقاسات والتوفر.",
    priceOnRequest: "السعر عند الطلب",
    order: "اطلب عبر واتساب",
    men: "رجال",
    back: "كل التشكيلة",
    howTo: "أرسلوا لنا الموديل عبر واتساب: نؤكد المقاس والسعر وموعد التوصيل.",
  },
};
