/**
 * Editorial (non-product) photography, used for campaign and category
 * imagery until PUT & GO's own photo shoots are available.
 * All images are from Unsplash (free licence, https://unsplash.com/license),
 * hotlinked from images.unsplash.com as Unsplash requires.
 * They never represent a product for sale.
 */
type Photo = { id: string; alt: string; page: string };

const p = (id: string, page: string, alt: string): Photo => ({ id, page, alt });

export const photos = {
  hero: p("photo-1527203561188-dae1bc1a417f", "QS9ZX5UnS14", "Portrait de profil sur fond doré"),
  heroAlt: p("photo-1695192053246-b90eb805f552", "zyq8i8A8Av0", "Femme en robe blanche"),
  women: p("photo-1709810529099-0ce6102692df", "HyoTmwZQwWU", "Femme en blazer noir sur fond rouge"),
  women2: p("photo-1632765866070-3fadf25d3d5b", "62wQhEghaw0", "Portrait de femme"),
  women3: p("photo-1613730317319-bc2d10ae54ff", "gbRTZdPv03w", "Portrait noir et blanc"),
  men: p("photo-1688120243155-1ffc1f965343", "qv9rvo8soJ8", "Homme en costume bleu"),
  men2: p("photo-1648389824823-483ec5ca228a", "85rUAzBoRSo", "Homme en chemise noire"),
  men3: p("photo-1620511450270-47162b983078", "KSazmALqLVg", "Homme en costume"),
  menCasual: p("photo-1614890085618-0e1054da74f8", "qC7jvmbEmRQ", "Homme en polo blanc"),
  menCity: p("photo-1617244145995-f79f45448c5c", "DlQhYZbti08", "Homme en chemise blanche en ville"),
  kids: p("photo-1759313560250-3bb4bc1d10bc", "GJ9ed5kqWqs", "Petite fille en robe bleue"),
  kids2: p("photo-1697906099479-20639005777e", "4-lqQpKeBY", "Petite fille assise"),
  traditional: p("photo-1696962701419-6f510910e838", "fBCptLC4GJY", "Tenue en wax vert et blanc"),
  traditional2: p("photo-1696962678565-bee84e6b9cb6", "rl7jMcSUnSg", "Tenue en wax sur fond jaune"),
  ceremony: p("photo-1695192053246-b90eb805f552", "zyq8i8A8Av0", "Robe blanche de soirée"),
  shoes: p("photo-1785357691642-62984be83ab7", "E0nD6lhIe3E", "Escarpins noirs"),
  shoes2: p("photo-1641893843833-a006778dc00b", "dYgEvR2gdgk", "Chaussures en cuir"),
  shoes3: p("photo-1581101767113-1677fc2beaa8", "ndpX28miBtE", "Escarpins argentés"),
  bag: p("photo-1584917865442-de89df76afd3", "oCXVxwTFwqE", "Sac à main en cuir rouge"),
  bag2: p("photo-1705909237050-7a7625b47fac", "lnbuoKz2GlM", "Sac en cuir noir"),
  bag3: p("photo-1682745230951-8a5aa9a474a0", "iUvQRvdIhsY", "Sac à main blanc"),
  jewelry: p("photo-1688406264720-e2f9389c9ed1", "eVqKdSJKW9Q", "Collier doré"),
  boutique: p("photo-1526745925052-dd824d27b9ab", "I8-T4lMCA6k", "Intérieur de boutique"),
} as const;

export type PhotoKey = keyof typeof photos;

export function photoUrl(photo: Photo, w: number, h?: number): string {
  const params = new URLSearchParams({ w: String(w), q: "80", auto: "format", fit: "crop" });
  if (h) params.set("h", String(h));
  return `https://images.unsplash.com/${photo.id}?${params.toString()}`;
}

export function photoSrcSet(photo: Photo, ratio?: number): string {
  return [480, 768, 1080, 1440, 1920].map((w) => `${photoUrl(photo, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(", ");
}

export const departmentPhoto: Record<string, PhotoKey> = {
  women: "women",
  men: "men",
  kids: "kids",
  shoes: "shoes",
  accessories: "bag",
  "new-arrivals": "heroAlt",
  "best-sellers": "women2",
  collections: "traditional",
  sale: "men2",
};
