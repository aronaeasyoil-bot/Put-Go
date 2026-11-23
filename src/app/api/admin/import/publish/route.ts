import { NextResponse, type NextRequest } from "next/server";
import { adminFetch, isShopifyAdminConfigured } from "@/lib/shopify/client";
import { canPublish, computeIssues, toShopifyProductSet, type DraftProduct } from "@/lib/import";
import { clientIp, isAdminRequest, rateLimit } from "@/lib/security";

/**
 * Sends reviewer-approved drafts to Shopify as DRAFT products.
 * Staff then activate them in Shopify Admin, which keeps Shopify the
 * authoritative source for live products, prices and inventory.
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req.headers)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!rateLimit(`import:${clientIp(req.headers)}`, 20, 60_000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (!isShopifyAdminConfigured()) return NextResponse.json({ error: "shopify_admin_not_configured" }, { status: 503 });
  const { drafts } = (await req.json().catch(() => ({}))) as { drafts?: DraftProduct[] };
  if (!Array.isArray(drafts) || drafts.length === 0 || drafts.length > 50) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const base = process.env.SHOPIFY_BASE_CURRENCY || "XOF";
  const results = [];
  for (const d of drafts) {
    const checked = { ...d, issues: computeIssues(d, base) };
    if (!canPublish(checked)) {
      results.push({ key: d.key, ok: false, error: "not_publishable", issues: checked.issues });
      continue;
    }
    try {
      const data = await adminFetch<{ productSet: { product: { id: string; handle: string } | null; userErrors: { message: string }[] } }>(
        `mutation Set($input: ProductSetInput!) { productSet(synchronous: true, input: $input) { product { id handle } userErrors { field message } } }`,
        { input: toShopifyProductSet(checked) },
      );
      const { product, userErrors } = data.productSet;
      results.push(userErrors.length ? { key: d.key, ok: false, error: userErrors.map((e) => e.message).join("; ") } : { key: d.key, ok: true, product });
    } catch (err) {
      results.push({ key: d.key, ok: false, error: String(err) });
    }
  }
  return NextResponse.json({ results });
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req.headers)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, shopifyAdmin: isShopifyAdminConfigured(), baseCurrency: process.env.SHOPIFY_BASE_CURRENCY || "XOF" });
}
