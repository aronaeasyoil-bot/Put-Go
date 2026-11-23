import { describe, expect, it } from "vitest";
import { canPublish, parseCsv, parsePrice, parseSourceFile, reconcile, toShopifyProductSet, titleSimilarity } from "@/lib/import";

const NOW = new Date("2026-11-23T00:00:00Z");

describe("parsePrice", () => {
  it("parses FCFA amounts with thousand separators", () => {
    expect(parsePrice("15 000 FCFA")).toEqual({ amount: 15000, currency: "XOF" });
    expect(parsePrice("25.000 F CFA")).toEqual({ amount: 25000, currency: "XOF" });
  });
  it("parses euro decimals", () => {
    expect(parsePrice("€45,50")).toEqual({ amount: 45.5, currency: "EUR" });
  });
  it("returns nothing for unclear values", () => {
    expect(parsePrice("prix en DM")).toEqual({});
    expect(parsePrice("")).toEqual({});
  });
});

describe("parseCsv", () => {
  it("handles quotes, escaped quotes and CRLF", () => {
    const rows = parseCsv('title,description\r\n"Robe ""Dakar""","Ligne 1, suite"\r\n');
    expect(rows).toEqual([{ title: 'Robe "Dakar"', description: "Ligne 1, suite" }]);
  });
});

describe("reconcile", () => {
  const csv = `source,source_url,source_id,title,price,currency,sizes,colors,category,images,published_at
whatsapp,https://wa.me/p/1,wa-1,Robe longue wax,25000,XOF,S|M|L,Noir,femme,https://cdn.example/a.jpg,2026-11-01
instagram,https://instagram.com/p/x,ig-1,Robe longue wax,22000,XOF,,,femme,https://cdn.example/b.jpg,2026-10-20
whatsapp,https://wa.me/p/2,wa-2,Chemise lin homme,18000,XOF,M|L,Blanc,homme,https://cdn.example/c.jpg,2026-11-02`;

  it("merges duplicates across sources and flags price conflicts", () => {
    const drafts = reconcile(parseSourceFile(csv, "x.csv", "manual"), "XOF", NOW);
    expect(drafts).toHaveLength(2);
    const robe = drafts.find((d) => d.title.startsWith("Robe"))!;
    expect(robe.sources.map((s) => s.source).sort()).toEqual(["instagram", "whatsapp"]);
    expect(robe.issues).toContain("price_conflict");
    expect(robe.price).toBeUndefined();
    expect(robe.images).toHaveLength(2);
  });

  it("never marks a draft approved automatically", () => {
    const drafts = reconcile(parseSourceFile(csv, "x.csv", "manual"), "XOF", NOW);
    expect(drafts.every((d) => !d.approved)).toBe(true);
    expect(drafts.some(canPublish)).toBe(false);
  });

  it("allows publishing only complete, approved drafts", () => {
    const [, chemise] = reconcile(parseSourceFile(csv, "x.csv", "manual"), "XOF", NOW);
    expect(chemise.issues).toEqual([]);
    expect(canPublish({ ...chemise, approved: true })).toBe(true);
  });

  it("flags stale prices and currency mismatches", () => {
    const old = `title,price,currency,sizes,category,images,published_at
Polo,10,EUR,M,homme,https://cdn.example/p.jpg,2025-01-01`;
    const [d] = reconcile(parseSourceFile(old, "x.csv", "whatsapp"), "XOF", NOW);
    expect(d.issues).toEqual(expect.arrayContaining(["stale_price", "currency_mismatch"]));
  });
});

describe("toShopifyProductSet", () => {
  it("creates a DRAFT product with one variant per size/colour", () => {
    const csv2 = `title,price,currency,sizes,colors,category,images\nChemise,18000,XOF,M|L,Blanc|Bleu,homme,https://cdn.example/c.jpg`;
    const [chemise] = reconcile(parseSourceFile(csv2, "x.csv", "whatsapp"), "XOF", NOW);
    const input = toShopifyProductSet(chemise);
    expect(input.status).toBe("DRAFT");
    expect(input.variants).toHaveLength(4);
    expect(input.variants[0].price).toBe("18000");
    expect(input.files[0]).toMatchObject({ originalSource: "https://cdn.example/c.jpg", contentType: "IMAGE" });
  });
});

describe("titleSimilarity", () => {
  it("ignores accents and case", () => {
    expect(titleSimilarity("Robe Élégante Noire", "robe elegante noire")).toBe(1);
  });
});
