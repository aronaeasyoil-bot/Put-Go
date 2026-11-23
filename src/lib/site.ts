export const SITE = {
  name: "PUT & GO",
  whatsappNumber: "221776601327",
  whatsappDisplay: "+221 77 660 13 27",
  whatsappUrl: "https://wa.me/221776601327",
  whatsappCatalogUrl: "https://wa.me/c/221776601327",
  instagramUrl: "https://www.instagram.com/put_and_go_officiel/",
  instagramHandle: "@put_and_go_officiel",
  logo: "/brand/put-and-go-logo.jpg",
  logoCrop: "/brand/put-and-go-logo-crop.jpg",
} as const;

/** Public base URL of the deployed site, used for canonical URLs, sitemap and WhatsApp links. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://put-and-go.arona-easyoil.workers.dev";
  return raw.replace(/\/+$/, "");
}
