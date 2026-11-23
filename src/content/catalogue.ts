import type { Locale } from "@/i18n/config";

/**
 * Pieces photographed by PUT & GO (photos supplied by the owner, 2026-11-23).
 * Prices are deliberately absent until the owner confirms them: the site shows
 * "Prix sur demande" and orders go through WhatsApp. Add `price` (XOF) only
 * from a confirmed source.
 */
export type Kind = "boubou" | "ensemble" | "tunique" | "djellaba" | "chemise";

export type CatalogueItem = {
  slug: string;
  kind: Kind;
  name: Record<Locale, string>;
  images: string[];
  price?: number; // XOF, confirmed by the owner
};

const L = (fr: string, en: string, ar: string) => ({ fr, en, ar });

export const catalogue: CatalogueItem[] = [
  { slug: "agbada-ivoire-brode", kind: "boubou", name: L("Grand boubou ivoire brodé", "Embroidered ivory grand boubou", "بوبو عاجي كبير مطرز"), images: ["agbada-ivoire-brode"] },
  { slug: "agbada-bleu-marine", kind: "boubou", name: L("Grand boubou bleu marine", "Navy grand boubou", "بوبو كبير كحلي"), images: ["agbada-bleu-marine"] },
  { slug: "grand-boubou-vert-bazin", kind: "boubou", name: L("Grand boubou vert olive damassé", "Olive damask grand boubou", "بوبو كبير زيتوني مطرز"), images: ["grand-boubou-vert-bazin"] },
  { slug: "ensemble-chocolat-brode", kind: "ensemble", name: L("Ensemble chocolat galon doré", "Chocolate set, gold trim", "طقم بني بشريط ذهبي"), images: ["ensemble-chocolat-brode"] },
  { slug: "tunique-bleu-bicolore", kind: "tunique", name: L("Tunique bleu bicolore", "Two-tone blue tunic", "قميص أزرق بلونين"), images: ["tunique-bleu-bicolore"] },
  { slug: "tunique-petrole-lion", kind: "tunique", name: L("Tunique bleu pétrole brodée lion", "Teal tunic, lion embroidery", "قميص أزرق بترولي بتطريز أسد"), images: ["tunique-petrole-lion"] },
  { slug: "djellaba-bleu-acier", kind: "djellaba", name: L("Djellaba bleu acier", "Steel blue djellaba", "جلابية زرقاء فولاذية"), images: ["djellaba-bleu-acier"] },
  { slug: "ensemble-pied-de-poule", kind: "ensemble", name: L("Ensemble pied-de-poule bicolore", "Two-tone houndstooth set", "طقم مربعات بلونين"), images: ["ensemble-pied-de-poule"] },
  { slug: "ensemble-prune", kind: "ensemble", name: L("Ensemble prune col zippé", "Plum zip-collar set", "طقم برقوقي بياقة بسحاب"), images: ["ensemble-prune"] },
  { slug: "tunique-beige-brodee", kind: "tunique", name: L("Tunique beige brodée", "Embroidered beige tunic", "قميص بيج مطرز"), images: ["tunique-beige-brodee"] },
  { slug: "djellaba-bleu-nuit", kind: "djellaba", name: L("Djellaba bleu nuit", "Midnight blue djellaba", "جلابية كحلية"), images: ["djellaba-bleu-nuit"] },
  { slug: "ensemble-rouge-brode", kind: "ensemble", name: L("Ensemble rouge brodé", "Embroidered red set", "طقم أحمر مطرز"), images: ["ensemble-rouge-brode"] },
  { slug: "grand-boubou-beige", kind: "boubou", name: L("Boubou long beige brodé", "Long embroidered beige kaftan", "قفطان بيج طويل مطرز"), images: ["grand-boubou-beige"] },
  { slug: "ensemble-vert-emeraude", kind: "ensemble", name: L("Ensemble vert émeraude", "Emerald green set", "طقم أخضر زمردي"), images: ["ensemble-vert-emeraude"] },
  { slug: "tunique-gris-zippee", kind: "tunique", name: L("Tunique gris perle zippée", "Pearl grey zip tunic", "قميص رمادي بسحاب"), images: ["tunique-gris-zippee"] },
  { slug: "djellaba-marron", kind: "djellaba", name: L("Djellaba marron col doré", "Brown djellaba, gold collar", "جلابية بنية بياقة ذهبية"), images: ["djellaba-marron", "djellaba-marron-2"] },
  { slug: "djellaba-lilas", kind: "djellaba", name: L("Djellaba lilas brodée", "Embroidered lilac djellaba", "جلابية ليلكية مطرزة"), images: ["djellaba-lilas"] },
  { slug: "djellaba-blanche", kind: "djellaba", name: L("Djellaba blanche à liseré", "White piped djellaba", "جلابية بيضاء بحواف"), images: ["djellaba-blanche"] },
  { slug: "tunique-terracotta", kind: "tunique", name: L("Tunique terracotta manches courtes", "Short-sleeve terracotta tunic", "قميص تيراكوتا بأكمام قصيرة"), images: ["tunique-terracotta"] },
  { slug: "ensemble-noir", kind: "ensemble", name: L("Ensemble noir col montant", "Black stand-collar set", "طقم أسود بياقة مرتفعة"), images: ["ensemble-noir"] },
  { slug: "chemise-bleu-ciel", kind: "chemise", name: L("Chemise bleu ciel", "Sky blue shirt", "قميص أزرق سماوي"), images: ["chemise-bleu-ciel"] },
];

export const catalogueImage = (key: string) => `/catalogue/${key}.webp`;
export const getCatalogueItem = (slug: string) => catalogue.find((i) => i.slug === slug);

export const catalogueText: Record<Locale, { title: string; kicker: string; intro: string; priceOnRequest: string; discoverPrice: string; priceMessage: string; order: string; men: string; back: string; howTo: string }> = {
  fr: {
    title: "La collection",
    kicker: "Homme · Pièces PUT & GO",
    intro: "Tenues traditionnelles et modernes confectionnées par PUT & GO à Dakar. Commandez directement sur WhatsApp : nous confirmons le prix, les tailles et la disponibilité.",
    priceOnRequest: "Prix sur demande",
    discoverPrice: "Découvrir le prix",
    priceMessage: "Bonjour PUT & GO, je souhaite connaître le prix de ce modèle :",
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
    discoverPrice: "Discover the price",
    priceMessage: "Hello PUT & GO, I would like to know the price of this model:",
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
    discoverPrice: "اكتشف السعر",
    priceMessage: "مرحبًا PUT & GO، أود معرفة سعر هذا الموديل:",
    order: "اطلب عبر واتساب",
    men: "رجال",
    back: "كل التشكيلة",
    howTo: "أرسلوا لنا الموديل عبر واتساب: نؤكد المقاس والسعر وموعد التوصيل.",
  },
};

/** Short editorial copy per garment type. Generic on purpose: no fabric,
 * size or delivery claims the owner has not confirmed. */
export const kindText: Record<Kind, Record<Locale, string>> = {
  boubou: {
    fr: "Le grand boubou, pièce maîtresse de l’élégance sénégalaise. Coupe ample et majestueuse, broderies raffinées : la tenue des grands jours, des cérémonies, de la Korité et de la Tabaski.",
    en: "The grand boubou, the centrepiece of Senegalese elegance. A generous, majestic cut and refined embroidery: the outfit for great days, ceremonies, Korité and Tabaski.",
    ar: "البوبو الكبير، قطعة الأناقة السنغالية بامتياز. قصّة واسعة مهيبة وتطريز متقن: زيّ المناسبات الكبرى والأعياد.",
  },
  ensemble: {
    fr: "Un ensemble tunique et pantalon signé PUT & GO, entre tradition et modernité. Lignes nettes, finitions soignées : à porter au bureau, en soirée comme pour les fêtes.",
    en: "A tunic-and-trousers set by PUT & GO, between tradition and modernity. Clean lines and careful finishing: for the office, evenings and celebrations.",
    ar: "طقم قميص وبنطال من PUT & GO، بين الأصالة والحداثة. خطوط أنيقة ولمسات متقنة: للعمل والسهرات والمناسبات.",
  },
  tunique: {
    fr: "Une tunique sénégalaise contemporaine, au détail brodé signature PUT & GO. Élégante sans effort, elle se porte aussi bien au quotidien que pour une occasion.",
    en: "A contemporary Senegalese tunic with a signature PUT & GO embroidered detail. Effortlessly elegant, for everyday wear or a special occasion.",
    ar: "قميص سنغالي عصري بتفصيل مطرز يحمل توقيع PUT & GO. أناقة بلا تكلّف، لليوم العادي وللمناسبات.",
  },
  djellaba: {
    fr: "Une djellaba longue à la coupe fluide, rehaussée de finitions délicates. Confort et prestance pour la prière du vendredi, les fêtes religieuses et les cérémonies.",
    en: "A long, fluid djellaba lifted by delicate finishing. Comfort and presence for Friday prayer, religious holidays and ceremonies.",
    ar: "جلابية طويلة بقصّة انسيابية ولمسات رقيقة. راحة وهيبة لصلاة الجمعة والأعياد والمناسبات.",
  },
  chemise: {
    fr: "Une chemise à la coupe ajustée, pensée pour un style chic et décontracté au quotidien.",
    en: "A tailored shirt designed for an everyday smart-casual style.",
    ar: "قميص بقصّة مضبوطة لأسلوب أنيق وعملي يوميًا.",
  },
};

export const madeToMeasure: Record<Locale, string> = {
  fr: "Intéressé par ce modèle ? Écrivez-nous sur WhatsApp : notre service client vous répond avec le prix, les tailles et coloris disponibles.",
  en: "Interested in this model? Message us on WhatsApp: our customer service will reply with the price, available sizes and colours.",
  ar: "هل أعجبكم هذا الموديل؟ راسلونا عبر واتساب: يرد عليكم فريق خدمة العملاء بالسعر والمقاسات والألوان المتوفرة.",
};

/** WhatsApp link to customer service asking the price of a model. */
export function priceEnquiryUrl(locale: Locale, item: CatalogueItem, pageUrl: string) {
  const text = `${catalogueText[locale].priceMessage} ${item.name[locale]} — ${pageUrl}`;
  return `https://wa.me/221776601327?text=${encodeURIComponent(text)}`;
}
