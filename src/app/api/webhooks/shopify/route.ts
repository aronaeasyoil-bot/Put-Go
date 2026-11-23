import { NextResponse, type NextRequest } from "next/server";
import { verifyShopifyWebhook } from "@/lib/security";

/**
 * Shopify webhook receiver (products/update, inventory_levels/update,
 * orders/fulfilled…). The HMAC signature is verified before anything is read.
 * Storefront pages read Shopify live on each request, so no cache purge is
 * needed today; this endpoint logs events for observability and is the hook
 * point for future automation (notifications, cache tags).
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const ok = await verifyShopifyWebhook(raw, req.headers.get("x-shopify-hmac-sha256"), process.env.SHOPIFY_WEBHOOK_SECRET);
  if (!ok) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  console.log("[shopify-webhook]", req.headers.get("x-shopify-topic"), req.headers.get("x-shopify-webhook-id"));
  return NextResponse.json({ ok: true });
}
