import { NextResponse, type NextRequest } from "next/server";
import { adminFetch, isShopifyAdminConfigured } from "@/lib/shopify/client";
import { clientIp, rateLimit } from "@/lib/security";

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

/**
 * Newsletter signup. Creates (or updates) a Shopify customer with email
 * marketing consent through the Admin API, so subscribers are managed in
 * Shopify. Returns 503 until the Admin API token is configured.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`nl:${clientIp(req.headers)}`, 5, 60_000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const { email, website } = (await req.json().catch(() => ({}))) as { email?: string; website?: string };
  if (website) return NextResponse.json({ ok: true }); // honeypot
  if (!email || !EMAIL.test(email.trim())) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!isShopifyAdminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const data = await adminFetch<{ customerCreate: { userErrors: { field: string[]; message: string }[] } }>(
      `mutation Subscribe($input: CustomerInput!) { customerCreate(input: $input) { customer { id } userErrors { field message } } }`,
      {
        input: {
          email: email.trim().toLowerCase(),
          tags: ["newsletter", "site-web"],
          emailMarketingConsent: { marketingState: "SUBSCRIBED", marketingOptInLevel: "SINGLE_OPT_IN" },
        },
      },
    );
    const errs = data.customerCreate.userErrors;
    if (errs.length && !errs.some((e) => /taken|déjà|already/i.test(e.message))) {
      console.error("[newsletter]", errs);
      return NextResponse.json({ error: "shopify_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "shopify_error" }, { status: 502 });
  }
}
