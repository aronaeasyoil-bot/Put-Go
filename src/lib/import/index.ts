/**
 * Catalogue import pipeline (pure functions, no I/O).
 *
 * Sources are owner-provided exports (CSV / JSON) of Instagram posts and
 * WhatsApp Business catalogue items. Nothing here scrapes Instagram or
 * WhatsApp. Records are reconciled into drafts that always require a human
 * approval before they can be sent to Shopify, and they are sent as DRAFT
 * products so Shopify stays the source of truth for live products.
 */

export type SourceKind = "instagram" | "whatsapp" | "manual";

export type SourceRecord = {
  source: SourceKind;
  sourceUrl?: string;
  sourceId?: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  sizes: string[];
  colors: string[];
  department?: string;
  subcategory?: string;
  images: string[];
  videos: string[];
  publishedAt?: string;
};

export type DraftIssue =
  | "missing_title"
  | "missing_price"
  | "missing_currency"
  | "missing_images"
  | "missing_department"
  | "missing_sizes"
  | "price_conflict"
  | "currency_mismatch"
  | "stale_price";

export type DraftProduct = {
  key: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  sizes: string[];
  colors: string[];
  department?: string;
  subcategory?: string;
  images: string[];
  videos: string[];
  sources: { source: SourceKind; url?: string; id?: string; price?: number; currency?: string; publishedAt?: string }[];
  issues: DraftIssue[];
  /** Reviewer decision. Never set automatically. */
  approved: boolean;
};

type Department = "women" | "men" | "kids" | "shoes" | "accessories";

const DEPARTMENT_ALIASES: Record<string, Department> = {
  women: "women", woman: "women", femme: "women", femmes: "women", dame: "women", dames: "women",
  men: "men", man: "men", homme: "men", hommes: "men",
  kids: "kids", kid: "kids", enfant: "kids", enfants: "kids", children: "kids", bebe: "kids", baby: "kids",
  shoes: "shoes", chaussures: "shoes", chaussure: "shoes",
  accessories: "accessories", accessoires: "accessories", accessoire: "accessories", sacs: "accessories", sac: "accessories",
};

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, " ")
    .trim();
}

export function normalizeDepartment(value?: string): string | undefined {
  if (!value) return undefined;
  return DEPARTMENT_ALIASES[normalizeText(value)] ?? undefined;
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parses a price such as "15 000 FCFA", "15.000", "€45,50". Returns undefined when unclear. */
export function parsePrice(value: unknown): { amount?: number; currency?: string } {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? { amount: value } : {};
  if (typeof value !== "string" || !value.trim()) return {};
  const raw = value.trim();
  let currency: string | undefined;
  if (/fcfa|cfa|xof/i.test(raw)) currency = "XOF";
  else if (/€|eur/i.test(raw)) currency = "EUR";
  else if (/aed|dhs?|درهم/i.test(raw)) currency = "AED";
  else if (/\$|usd/i.test(raw)) currency = "USD";
  const digits = raw.replace(/[^\d.,\s]/g, "").trim();
  if (!digits) return { currency };
  let n: number;
  if (currency === "XOF" || /^\d{1,3}([ .]\d{3})+$/.test(digits)) {
    n = Number(digits.replace(/[ .,]/g, ""));
  } else {
    const cleaned = digits.replace(/\s/g, "");
    const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
    if (lastSep >= 0 && cleaned.length - lastSep - 1 === 2) {
      n = Number(cleaned.slice(0, lastSep).replace(/[.,]/g, "") + "." + cleaned.slice(lastSep + 1));
    } else {
      n = Number(cleaned.replace(/[.,]/g, ""));
    }
  }
  return Number.isFinite(n) && n > 0 ? { amount: n, currency } : { currency };
}

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === "," || c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (nonEmpty.length < 2) return [];
  const header = nonEmpty[0].map((h) => normalizeText(h).replace(/ /g, "_"));
  return nonEmpty.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const pick = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
};

/** Maps a loosely-structured row (CSV or JSON) to a SourceRecord. */
export function toSourceRecord(row: Record<string, unknown>, fallbackSource: SourceKind): SourceRecord {
  const srcRaw = String(pick(row, "source") ?? fallbackSource).toLowerCase();
  const source: SourceKind = srcRaw.includes("insta") ? "instagram" : srcRaw.includes("whats") ? "whatsapp" : srcRaw === "manual" ? "manual" : fallbackSource;
  const price = parsePrice(pick(row, "price", "prix", "amount"));
  const currencyField = pick(row, "currency", "devise");
  return {
    source,
    sourceUrl: (pick(row, "source_url", "url", "link", "lien", "permalink") as string | undefined) ?? undefined,
    sourceId: (pick(row, "source_id", "id", "retailer_id", "sku") as string | undefined)?.toString(),
    title: String(pick(row, "title", "name", "nom", "titre") ?? "").trim(),
    description: (pick(row, "description", "caption", "legende") as string | undefined)?.toString().trim(),
    price: price.amount,
    currency: currencyField ? String(currencyField).toUpperCase().trim() : price.currency,
    sizes: splitList(pick(row, "sizes", "size", "tailles", "taille")),
    colors: splitList(pick(row, "colors", "color", "couleurs", "couleur")),
    department: normalizeDepartment(pick(row, "department", "category", "categorie", "rayon") as string | undefined),
    subcategory: (pick(row, "subcategory", "sous_categorie", "type", "product_type") as string | undefined)?.toString().trim(),
    images: splitList(pick(row, "images", "image", "image_url", "image_urls", "media_url", "photos")),
    videos: splitList(pick(row, "videos", "video", "video_url")),
    publishedAt: (pick(row, "published_at", "timestamp", "date") as string | undefined)?.toString(),
  };
}

export function parseSourceFile(text: string, filename: string, fallbackSource: SourceKind): SourceRecord[] {
  const isJson = filename.toLowerCase().endsWith(".json") || text.trim().startsWith("[") || text.trim().startsWith("{");
  let rows: Record<string, unknown>[];
  if (isJson) {
    const parsed = JSON.parse(text) as unknown;
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { data?: unknown }).data)
        ? (parsed as { data: unknown[] }).data
        : Array.isArray((parsed as { products?: unknown }).products)
          ? (parsed as { products: unknown[] }).products
          : [];
    rows = list.filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null);
  } else {
    rows = parseCsv(text);
  }
  return rows.map((r) => toSourceRecord(r, fallbackSource)).filter((r) => r.title || r.images.length);
}

function tokens(s: string): Set<string> {
  return new Set(normalizeText(s).split(" ").filter((t) => t.length > 1));
}

export function titleSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

/** Two records describe the same product if they share a media URL or a source id, or have near-identical titles in a compatible department. */
export function isSameProduct(a: SourceRecord | DraftProduct, b: SourceRecord): boolean {
  const imgsA = new Set(a.images);
  if (b.images.some((i) => imgsA.has(i))) return true;
  const idsA = "sources" in a ? a.sources.map((s) => s.id).filter(Boolean) : [a.sourceId].filter(Boolean);
  if (b.sourceId && idsA.includes(b.sourceId)) return true;
  if (a.department && b.department && a.department !== b.department) return false;
  return titleSimilarity(a.title, b.title) >= 0.75;
}

const unique = <T,>(xs: T[]) => Array.from(new Set(xs));

const STALE_DAYS = 120;

export function computeIssues(d: Omit<DraftProduct, "issues">, baseCurrency: string, now = new Date()): DraftIssue[] {
  const issues: DraftIssue[] = [];
  if (!d.title) issues.push("missing_title");
  if (d.price === undefined) issues.push("missing_price");
  if (!d.currency) issues.push("missing_currency");
  else if (d.currency !== baseCurrency) issues.push("currency_mismatch");
  if (!d.images.length) issues.push("missing_images");
  if (!d.department) issues.push("missing_department");
  if (!d.sizes.length && d.department !== "accessories") issues.push("missing_sizes");
  const priced = d.sources.filter((s) => s.price !== undefined);
  // Sources disagree and no reviewer has chosen a price yet.
  if (d.price === undefined && unique(priced.map((s) => `${s.price}|${s.currency ?? ""}`)).length > 1) issues.push("price_conflict");
  const dates = d.sources.map((s) => (s.publishedAt ? Date.parse(s.publishedAt) : NaN)).filter(Number.isFinite);
  if (dates.length && now.getTime() - Math.max(...dates) > STALE_DAYS * 86_400_000) issues.push("stale_price");
  return issues;
}

/**
 * Groups source records into draft products, merging duplicates across
 * Instagram and WhatsApp. Conflicting prices are kept per source and flagged;
 * the draft price is left empty until a reviewer picks one.
 */
export function reconcile(records: SourceRecord[], baseCurrency = "XOF", now = new Date()): DraftProduct[] {
  const drafts: DraftProduct[] = [];
  for (const r of records) {
    const existing = drafts.find((d) => isSameProduct(d, r));
    const src = { source: r.source, url: r.sourceUrl, id: r.sourceId, price: r.price, currency: r.currency, publishedAt: r.publishedAt };
    if (existing) {
      existing.sources.push(src);
      existing.images = unique([...existing.images, ...r.images]);
      existing.videos = unique([...existing.videos, ...r.videos]);
      existing.sizes = unique([...existing.sizes, ...r.sizes]);
      existing.colors = unique([...existing.colors, ...r.colors]);
      existing.department ??= r.department;
      existing.subcategory ??= r.subcategory;
      if (!existing.description && r.description) existing.description = r.description;
      if (r.title.length > existing.title.length && r.source === "whatsapp") existing.title = r.title;
    } else {
      drafts.push({
        key: `${r.source}:${r.sourceId ?? r.sourceUrl ?? normalizeText(r.title).replace(/ /g, "-")}`,
        title: r.title,
        description: r.description ?? "",
        price: r.price,
        currency: r.currency,
        sizes: unique(r.sizes),
        colors: unique(r.colors),
        department: r.department,
        subcategory: r.subcategory,
        images: unique(r.images),
        videos: unique(r.videos),
        sources: [src],
        issues: [],
        approved: false,
      });
    }
  }
  return drafts.map((d) => {
    const priced = d.sources.filter((s) => s.price !== undefined);
    const distinct = unique(priced.map((s) => `${s.price}|${s.currency ?? ""}`));
    if (distinct.length === 1) {
      d.price = priced[0].price;
      d.currency = priced[0].currency ?? d.currency;
    } else if (distinct.length > 1) {
      d.price = undefined;
    }
    return { ...d, issues: computeIssues(d, baseCurrency, now) };
  });
}

/** A draft may be sent to Shopify only when a reviewer approved it and nothing is missing or conflicting. */
export function canPublish(d: DraftProduct): boolean {
  return d.approved && d.issues.filter((i) => i !== "stale_price").length === 0;
}

/** Builds the Shopify Admin `productSet` input. Products are always created as DRAFT. */
export function toShopifyProductSet(d: DraftProduct) {
  const options: { name: string; values: { name: string }[] }[] = [];
  if (d.sizes.length) options.push({ name: "Taille", values: d.sizes.map((name) => ({ name })) });
  if (d.colors.length) options.push({ name: "Couleur", values: d.colors.map((name) => ({ name })) });
  const combos: { optionName: string; name: string }[][] = [[]];
  for (const o of options) {
    const next: { optionName: string; name: string }[][] = [];
    for (const c of combos) for (const v of o.values) next.push([...c, { optionName: o.name, name: v.name }]);
    combos.splice(0, combos.length, ...next);
  }
  const tags = unique([
    `import:${d.sources.map((s) => s.source).join("+")}`,
    d.department ? `department:${d.department}` : "",
    d.subcategory ? `sub:${normalizeText(d.subcategory).replace(/ /g, "-")}` : "",
  ].filter(Boolean));
  return {
    title: d.title,
    descriptionHtml: d.description ? `<p>${escapeHtml(d.description).replace(/\n/g, "<br>")}</p>` : "",
    productType: d.subcategory ?? "",
    status: "DRAFT" as const,
    tags,
    productOptions: options.length ? options : [{ name: "Title", values: [{ name: "Default Title" }] }],
    variants: (options.length ? combos : [[{ optionName: "Title", name: "Default Title" }]]).map((optionValues) => ({
      optionValues,
      price: d.price!.toString(),
    })),
    files: d.images.map((originalSource) => ({ originalSource, contentType: "IMAGE" as const, alt: d.title })),
  };
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
