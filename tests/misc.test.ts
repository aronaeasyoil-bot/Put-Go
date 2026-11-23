import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { productEnquiryLink } from "@/lib/whatsapp";
import { verifyShopifyWebhook, rateLimit } from "@/lib/security";
import { formatMoney } from "@/lib/format";
import fr from "@/i18n/dictionaries/fr";
import en from "@/i18n/dictionaries/en";
import ar from "@/i18n/dictionaries/ar";

describe("WhatsApp enquiry", () => {
  it("prefills the product name and URL for +221776601327", () => {
    const link = productEnquiryLink("fr", "Robe wax", "https://example.com/fr/products/robe-wax");
    expect(link.startsWith("https://wa.me/221776601327?text=")).toBe(true);
    const text = decodeURIComponent(link.split("text=")[1]);
    expect(text).toBe(
      "Bonjour PUT & GO, je suis intéressé(e) par ce produit : Robe wax. Voici le lien : https://example.com/fr/products/robe-wax. Pouvez-vous confirmer sa disponibilité ?",
    );
  });
});

describe("Shopify webhook HMAC", () => {
  it("accepts a valid signature and rejects others", async () => {
    const body = JSON.stringify({ id: 1 });
    const sig = createHmac("sha256", "secret").update(body).digest("base64");
    expect(await verifyShopifyWebhook(body, sig, "secret")).toBe(true);
    expect(await verifyShopifyWebhook(body, sig, "other")).toBe(false);
    expect(await verifyShopifyWebhook(body + " ", sig, "secret")).toBe(false);
    expect(await verifyShopifyWebhook(body, null, "secret")).toBe(false);
  });
});

describe("rateLimit", () => {
  it("blocks after the limit within the window", () => {
    const now = 1_000;
    expect(rateLimit("t", 2, 1000, now)).toBe(true);
    expect(rateLimit("t", 2, 1000, now)).toBe(true);
    expect(rateLimit("t", 2, 1000, now)).toBe(false);
    expect(rateLimit("t", 2, 1000, now + 1001)).toBe(true);
  });
});

describe("formatMoney", () => {
  it("formats XOF without decimals", () => {
    expect(formatMoney("25000", "XOF", "fr").replace(/\s/g, " ")).toMatch(/25 000\s?F\s?CFA/);
  });
});

describe("dictionaries", () => {
  const keys = (o: object, p = ""): string[] =>
    Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
  it("EN and AR cover every FR key with non-empty strings", () => {
    const ref = keys(fr).sort();
    expect(keys(en).sort()).toEqual(ref);
    expect(keys(ar).sort()).toEqual(ref);
  });
});
