import type { Locale } from "@/i18n/config";

/**
 * Informational pages. They state only facts known today and clearly mark
 * what is still to be confirmed by PUT & GO (rates, delivery times, legal
 * entity details). Nothing here invents prices, delays or company details.
 */
export type Block = { h?: string; p?: string[]; list?: string[]; table?: { head: string[]; rows: string[][] } };
export type InfoPage = { title: string; intro?: string; blocks: Block[]; pending?: boolean };

export const infoSlugs = ["contact", "faq", "size-guide", "shipping", "returns", "payments", "about", "privacy", "terms", "cookies"] as const;
export type InfoSlug = (typeof infoSlugs)[number];

const sizeTables = {
  women: {
    head: ["FR / EU", "UK", "US", "INT"],
    rows: [["34", "6", "2", "XS"], ["36", "8", "4", "S"], ["38", "10", "6", "M"], ["40", "12", "8", "L"], ["42", "14", "10", "XL"], ["44", "16", "12", "XXL"]],
  },
  men: {
    head: ["FR / EU", "UK / US", "INT"],
    rows: [["44", "34", "XS"], ["46", "36", "S"], ["48", "38", "M"], ["50", "40", "L"], ["52", "42", "XL"], ["54", "44", "XXL"]],
  },
  shoes: {
    head: ["EU", "UK", "US (F)", "US (H)"],
    rows: [["36", "3.5", "6", "—"], ["37", "4", "6.5", "—"], ["38", "5", "7.5", "6"], ["39", "6", "8.5", "6.5"], ["40", "6.5", "9", "7"], ["41", "7.5", "—", "8"], ["42", "8", "—", "8.5"], ["43", "9", "—", "9.5"], ["44", "9.5", "—", "10"], ["45", "10.5", "—", "11"]],
  },
};

const fr: Record<InfoSlug, InfoPage> = {
  contact: {
    title: "Contact",
    intro: "Notre service client répond sur WhatsApp et par téléphone. Indiquez le nom de l’article ou envoyez son lien pour une réponse plus rapide.",
    blocks: [
      { h: "WhatsApp & téléphone", list: ["+221 77 660 13 27 (WhatsApp)", "Catalogue WhatsApp : wa.me/c/221776601327"] },
      { h: "Instagram", list: ["@put_and_go_officiel"] },
      { h: "Localisation", p: ["Dakar, Sénégal. Toutes les commandes sont expédiées depuis le Sénégal."] },
    ],
  },
  faq: {
    title: "Questions fréquentes",
    blocks: [
      { h: "Où êtes-vous situés ?", p: ["PUT & GO est basé à Dakar, au Sénégal. Tous les articles sont expédiés depuis le Sénégal."] },
      { h: "Livrez-vous à l’international ?", p: ["Oui, nous préparons la livraison vers le Sénégal, l’Afrique, l’Europe, Dubaï / les Émirats et d’autres destinations. Seuls les pays dont la livraison est confirmée sont proposés au paiement."] },
      { h: "Comment connaître les frais et délais de livraison ?", p: ["Ils sont calculés et affichés au paiement en fonction de votre adresse, avant toute validation de commande."] },
      { h: "Quels moyens de paiement acceptez-vous ?", p: ["Les moyens de paiement actifs sont affichés sur la page de paiement sécurisée. Consultez la page « Paiement » pour l’état de chaque moyen."] },
      { h: "Comment choisir ma taille ?", p: ["Consultez notre guide des tailles ou demandez conseil sur WhatsApp en précisant l’article."] },
      { h: "Un article est-il disponible ?", p: ["Le stock affiché sur le site est celui de notre boutique en ligne. Pour un article vu sur Instagram ou WhatsApp, écrivez-nous pour confirmer sa disponibilité."] },
      { h: "Puis-je retourner un article ?", p: ["Consultez la page « Retours & échanges ». Les conditions définitives y sont publiées par PUT & GO."] },
    ],
  },
  "size-guide": {
    title: "Guide des tailles",
    intro: "Tableaux de correspondance internationaux indicatifs. Les mesures exactes de chaque article sont précisées sur sa fiche lorsqu’elles sont disponibles. En cas de doute, contactez-nous sur WhatsApp.",
    blocks: [
      { h: "Femme — vêtements", table: sizeTables.women },
      { h: "Homme — vestes & costumes", table: sizeTables.men },
      { h: "Chaussures", table: sizeTables.shoes },
      { h: "Enfant", p: ["Les tailles enfant sont exprimées en âge (mois / ans) sur chaque fiche produit. Demandez-nous les mesures précises sur WhatsApp."] },
    ],
  },
  shipping: {
    title: "Livraison",
    intro: "Tous les articles sont expédiés depuis le Sénégal.",
    blocks: [
      { h: "Zones préparées", list: ["Sénégal", "Afrique de l’Ouest", "Autres pays d’Afrique", "France", "Autres pays d’Europe", "Dubaï et Émirats arabes unis", "Autres destinations internationales éligibles"] },
      { h: "Tarifs et délais", p: ["Les tarifs et délais de chaque zone sont en cours de confirmation avec nos transporteurs. Ils sont calculés et affichés au paiement. Un pays dont la livraison n’est pas confirmée n’est pas proposé au paiement."] },
      { h: "Transporteurs", p: ["Transporteurs internationaux express (DHL, FedEx…) et livreurs locaux à Dakar : sélection en cours."] },
      { h: "Suivi", p: ["Dès l’expédition, vous recevez une notification avec le numéro de suivi lorsque le transporteur en fournit un. Vos commandes sont visibles dans votre espace client."] },
      { h: "Douanes", p: ["Pour les livraisons hors Sénégal, des droits et taxes d’importation peuvent être demandés par le pays de destination. Ils sont à la charge du destinataire sauf mention contraire au paiement."] },
    ],
  },
  returns: { title: "Retours & échanges", blocks: [{ p: ["Pour toute demande de retour ou d’échange, contactez-nous sur WhatsApp avec votre numéro de commande."] }], pending: true },
  payments: {
    title: "Moyens de paiement",
    intro: "Le paiement est finalisé sur le checkout sécurisé de Shopify. Seuls les moyens de paiement réellement configurés et testés y sont proposés.",
    blocks: [
      {
        h: "État des moyens de paiement",
        table: {
          head: ["Moyen", "Zone", "État"],
          rows: [
            ["Carte bancaire (Visa, Mastercard)", "International", "À configurer"],
            ["Apple Pay / Google Pay", "Selon prestataire", "À configurer"],
            ["Orange Money", "Sénégal", "À vérifier (prestataire compatible Shopify)"],
            ["Wave", "Sénégal", "À vérifier (prestataire compatible Shopify)"],
          ],
        },
      },
      { p: ["La devise de paiement est affichée au checkout. Elle peut différer de la devise d’affichage selon la configuration de la boutique."] },
    ],
  },
  about: {
    title: "À propos",
    blocks: [
      { p: ["« Just Put what you want and Go with Satisfaction. »", "PUT & GO est une maison de mode basée à Dakar, au Sénégal. Nous habillons femmes, hommes et enfants avec des vêtements, chaussures et accessoires élégants, modernes et accessibles.", "Nous livrons au Sénégal et préparons la livraison vers l’Afrique, l’Europe, Dubaï et le reste du monde."] },
    ],
  },
  privacy: { title: "Politique de confidentialité", blocks: [{ h: "En résumé", list: ["Les paiements sont traités par Shopify ; nous ne stockons pas vos données de carte.", "Les mesures d’audience ne sont activées qu’avec votre consentement.", "Vous pouvez demander l’accès ou la suppression de vos données en nous contactant sur WhatsApp."] }], pending: true },
  terms: { title: "Conditions générales de vente", blocks: [], pending: true },
  cookies: {
    title: "Cookies",
    blocks: [
      { h: "Cookies essentiels", list: ["pg_cart : identifiant de votre panier (30 jours)", "pg_country : pays sélectionné pour l’affichage des prix (12 mois)"] },
      { h: "Stockage local", list: ["pg_wishlist : vos favoris, conservés uniquement dans votre navigateur", "pg_consent : votre choix concernant les cookies"] },
      { h: "Mesure d’audience", p: ["Cloudflare Web Analytics (sans cookie) est chargé uniquement si vous acceptez."] },
    ],
  },
};

const en: Record<InfoSlug, InfoPage> = {
  contact: {
    title: "Contact",
    intro: "Our customer service answers on WhatsApp and by phone. Include the item name or link for a faster reply.",
    blocks: [
      { h: "WhatsApp & phone", list: ["+221 77 660 13 27 (WhatsApp)", "WhatsApp catalogue: wa.me/c/221776601327"] },
      { h: "Instagram", list: ["@put_and_go_officiel"] },
      { h: "Location", p: ["Dakar, Senegal. All orders ship from Senegal."] },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    blocks: [
      { h: "Where are you based?", p: ["PUT & GO is based in Dakar, Senegal. All items ship from Senegal."] },
      { h: "Do you ship internationally?", p: ["Yes, we are preparing delivery to Senegal, Africa, Europe, Dubai / UAE and other destinations. Only countries with confirmed delivery are offered at checkout."] },
      { h: "How do I know shipping costs and times?", p: ["They are calculated and shown at checkout for your address, before you confirm the order."] },
      { h: "Which payment methods do you accept?", p: ["Active payment methods are shown on the secure checkout page. See the “Payment” page for the status of each method."] },
      { h: "How do I choose my size?", p: ["Check our size guide or ask us on WhatsApp, mentioning the item."] },
      { h: "Is an item available?", p: ["Stock shown on the website is our online store stock. For an item seen on Instagram or WhatsApp, message us to confirm availability."] },
      { h: "Can I return an item?", p: ["See the “Returns & exchanges” page, where PUT & GO publishes its final conditions."] },
    ],
  },
  "size-guide": {
    title: "Size guide",
    intro: "Indicative international conversion charts. Exact measurements are given on each product page when available. If in doubt, contact us on WhatsApp.",
    blocks: [
      { h: "Women — clothing", table: sizeTables.women },
      { h: "Men — jackets & suits", table: sizeTables.men },
      { h: "Shoes", table: sizeTables.shoes },
      { h: "Kids", p: ["Kids sizes are given by age (months / years) on each product page. Ask us for exact measurements on WhatsApp."] },
    ],
  },
  shipping: {
    title: "Delivery",
    intro: "All items ship from Senegal.",
    blocks: [
      { h: "Zones in preparation", list: ["Senegal", "West Africa", "Other African countries", "France", "Other European countries", "Dubai and the United Arab Emirates", "Other eligible worldwide destinations"] },
      { h: "Rates and delivery times", p: ["Rates and delivery times for each zone are being confirmed with our carriers. They are calculated and shown at checkout. Countries without confirmed delivery are not offered at checkout."] },
      { h: "Carriers", p: ["International express carriers (DHL, FedEx…) and local couriers in Dakar: selection in progress."] },
      { h: "Tracking", p: ["When your order ships you receive a notification with the tracking number when the carrier provides one. Orders are listed in your customer account."] },
      { h: "Customs", p: ["For deliveries outside Senegal, import duties and taxes may be charged by the destination country. They are paid by the recipient unless stated otherwise at checkout."] },
    ],
  },
  returns: { title: "Returns & exchanges", blocks: [{ p: ["For any return or exchange request, contact us on WhatsApp with your order number."] }], pending: true },
  payments: {
    title: "Payment methods",
    intro: "Payment is completed on Shopify’s secure checkout. Only payment methods that have been configured and tested are offered there.",
    blocks: [
      {
        h: "Payment method status",
        table: {
          head: ["Method", "Region", "Status"],
          rows: [
            ["Card (Visa, Mastercard)", "International", "To be configured"],
            ["Apple Pay / Google Pay", "Depends on provider", "To be configured"],
            ["Orange Money", "Senegal", "To be verified (Shopify-compatible provider)"],
            ["Wave", "Senegal", "To be verified (Shopify-compatible provider)"],
          ],
        },
      },
      { p: ["The payment currency is shown at checkout. It may differ from the display currency depending on the store configuration."] },
    ],
  },
  about: {
    title: "About",
    blocks: [
      { p: ["“Just Put what you want and Go with Satisfaction.”", "PUT & GO is a fashion house based in Dakar, Senegal. We dress women, men and kids in elegant, modern and accessible clothing, shoes and accessories.", "We deliver across Senegal and are preparing delivery to Africa, Europe, Dubai and worldwide."] },
    ],
  },
  privacy: { title: "Privacy policy", blocks: [{ h: "In short", list: ["Payments are processed by Shopify; we do not store your card details.", "Audience measurement is only enabled with your consent.", "You can request access to or deletion of your data by contacting us on WhatsApp."] }], pending: true },
  terms: { title: "Terms of sale", blocks: [], pending: true },
  cookies: {
    title: "Cookies",
    blocks: [
      { h: "Essential cookies", list: ["pg_cart: your bag identifier (30 days)", "pg_country: country selected for price display (12 months)"] },
      { h: "Local storage", list: ["pg_wishlist: your wishlist, kept only in your browser", "pg_consent: your cookie choice"] },
      { h: "Audience measurement", p: ["Cloudflare Web Analytics (cookieless) is loaded only if you accept."] },
    ],
  },
};

const ar: Record<InfoSlug, InfoPage> = {
  contact: {
    title: "اتصل بنا",
    intro: "تجيب خدمة العملاء عبر واتساب والهاتف. أرسل اسم المنتج أو رابطه لرد أسرع.",
    blocks: [
      { h: "واتساب والهاتف", list: ["‎+221 77 660 13 27 (واتساب)", "كتالوج واتساب: wa.me/c/221776601327"] },
      { h: "إنستغرام", list: ["@put_and_go_officiel"] },
      { h: "الموقع", p: ["داكار، السنغال. تُشحن جميع الطلبات من السنغال."] },
    ],
  },
  faq: {
    title: "الأسئلة الشائعة",
    blocks: [
      { h: "أين تقعون؟", p: ["يقع مقر PUT & GO في داكار، السنغال. تُشحن جميع المنتجات من السنغال."] },
      { h: "هل تشحنون دوليًا؟", p: ["نعم، نُعدّ التوصيل إلى السنغال وأفريقيا وأوروبا ودبي / الإمارات ووجهات أخرى. لا تُعرض عند الدفع إلا الدول التي تم تأكيد التوصيل إليها."] },
      { h: "كيف أعرف تكلفة ومدة التوصيل؟", p: ["تُحسب وتُعرض عند الدفع حسب عنوانك قبل تأكيد الطلب."] },
      { h: "ما طرق الدفع المقبولة؟", p: ["تظهر طرق الدفع المفعّلة في صفحة الدفع الآمنة. راجع صفحة «الدفع» لمعرفة حالة كل طريقة."] },
      { h: "كيف أختار مقاسي؟", p: ["راجع دليل المقاسات أو اسألنا عبر واتساب مع ذكر المنتج."] },
      { h: "هل المنتج متوفر؟", p: ["المخزون المعروض على الموقع هو مخزون متجرنا الإلكتروني. لمنتج شاهدته على إنستغرام أو واتساب، راسلنا لتأكيد توفره."] },
      { h: "هل يمكنني إرجاع منتج؟", p: ["راجع صفحة «الإرجاع والاستبدال» حيث تنشر PUT & GO شروطها النهائية."] },
    ],
  },
  "size-guide": {
    title: "دليل المقاسات",
    intro: "جداول تحويل دولية إرشادية. تُذكر القياسات الدقيقة في صفحة كل منتج عند توفرها. عند الشك، تواصل معنا عبر واتساب.",
    blocks: [
      { h: "نساء — ملابس", table: sizeTables.women },
      { h: "رجال — جاكيتات وبدلات", table: sizeTables.men },
      { h: "أحذية", table: sizeTables.shoes },
      { h: "أطفال", p: ["تُذكر مقاسات الأطفال حسب العمر (أشهر / سنوات) في صفحة كل منتج. اطلب القياسات الدقيقة عبر واتساب."] },
    ],
  },
  shipping: {
    title: "التوصيل",
    intro: "تُشحن جميع المنتجات من السنغال.",
    blocks: [
      { h: "المناطق قيد الإعداد", list: ["السنغال", "غرب أفريقيا", "دول أفريقية أخرى", "فرنسا", "دول أوروبية أخرى", "دبي والإمارات العربية المتحدة", "وجهات دولية أخرى مؤهلة"] },
      { h: "الأسعار والمدة", p: ["يجري تأكيد أسعار ومدة التوصيل لكل منطقة مع شركات الشحن. تُحسب وتُعرض عند الدفع. لا تُعرض الدول غير المؤكدة عند الدفع."] },
      { h: "شركات الشحن", p: ["شركات الشحن الدولي السريع (DHL وFedEx…) وموزعون محليون في داكار: الاختيار جارٍ."] },
      { h: "التتبع", p: ["عند شحن طلبك تصلك رسالة برقم التتبع إن وفّرته شركة الشحن. تظهر طلباتك في حسابك."] },
      { h: "الجمارك", p: ["للتوصيل خارج السنغال، قد تفرض دولة الوجهة رسومًا وضرائب استيراد يتحملها المستلم ما لم يُذكر خلاف ذلك عند الدفع."] },
    ],
  },
  returns: { title: "الإرجاع والاستبدال", blocks: [{ p: ["لأي طلب إرجاع أو استبدال، تواصل معنا عبر واتساب مع رقم طلبك."] }], pending: true },
  payments: {
    title: "طرق الدفع",
    intro: "يتم الدفع عبر صفحة الدفع الآمنة من Shopify. لا تُعرض إلا طرق الدفع التي تم إعدادها واختبارها.",
    blocks: [
      {
        h: "حالة طرق الدفع",
        table: {
          head: ["الطريقة", "المنطقة", "الحالة"],
          rows: [
            ["بطاقة (Visa، Mastercard)", "دولي", "قيد الإعداد"],
            ["Apple Pay / Google Pay", "حسب مزود الخدمة", "قيد الإعداد"],
            ["Orange Money", "السنغال", "قيد التحقق (مزود متوافق مع Shopify)"],
            ["Wave", "السنغال", "قيد التحقق (مزود متوافق مع Shopify)"],
          ],
        },
      },
      { p: ["تظهر عملة الدفع عند إتمام الطلب وقد تختلف عن عملة العرض حسب إعدادات المتجر."] },
    ],
  },
  about: {
    title: "من نحن",
    blocks: [
      { p: ["«Just Put what you want and Go with Satisfaction.»", "PUT & GO دار أزياء مقرها داكار، السنغال. نُلبس النساء والرجال والأطفال ملابس وأحذية وإكسسوارات أنيقة وعصرية وبأسعار مناسبة.", "نوصّل داخل السنغال ونُعدّ التوصيل إلى أفريقيا وأوروبا ودبي والعالم."] },
    ],
  },
  privacy: { title: "سياسة الخصوصية", blocks: [{ h: "باختصار", list: ["تتم معالجة المدفوعات عبر Shopify؛ لا نخزّن بيانات بطاقتك.", "لا يُفعّل قياس الجمهور إلا بموافقتك.", "يمكنك طلب الوصول إلى بياناتك أو حذفها بالتواصل معنا عبر واتساب."] }], pending: true },
  terms: { title: "شروط البيع العامة", blocks: [], pending: true },
  cookies: {
    title: "ملفات تعريف الارتباط",
    blocks: [
      { h: "ملفات أساسية", list: ["pg_cart: معرّف سلتك (30 يومًا)", "pg_country: البلد المختار لعرض الأسعار (12 شهرًا)"] },
      { h: "التخزين المحلي", list: ["pg_wishlist: مفضلتك، محفوظة في متصفحك فقط", "pg_consent: اختيارك بشأن ملفات تعريف الارتباط"] },
      { h: "قياس الجمهور", p: ["لا يتم تحميل Cloudflare Web Analytics (بدون ملفات تعريف ارتباط) إلا إذا وافقت."] },
    ],
  },
};

export const infoPages: Record<Locale, Record<InfoSlug, InfoPage>> = { fr, en, ar };

export function isInfoSlug(v: string): v is InfoSlug {
  return (infoSlugs as readonly string[]).includes(v);
}
