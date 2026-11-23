import "server-only";

export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-10";

export function shopifyDomain(): string | undefined {
  const d = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  return d ? d.replace(/^https?:\/\//, "").replace(/\/+$/, "") : undefined;
}

/** True when the Storefront API can be called (domain + one storefront token). */
export function isShopifyConfigured(): boolean {
  return !!shopifyDomain() && !!(process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN);
}

export function isShopifyAdminConfigured(): boolean {
  return !!shopifyDomain() && !!process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
}

export class ShopifyError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
  }
}

type GqlResponse<T> = { data?: T; errors?: { message: string }[] };

export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { buyerIp?: string } = {},
): Promise<T> {
  const domain = shopifyDomain();
  if (!domain || !isShopifyConfigured()) throw new ShopifyError("Shopify Storefront API is not configured");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (privateToken) {
    headers["Shopify-Storefront-Private-Token"] = privateToken;
    if (opts.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = opts.buyerIp;
  } else {
    headers["X-Shopify-Storefront-Access-Token"] = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN!;
  }
  const res = await fetch(`https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new ShopifyError(`Storefront API HTTP ${res.status}`);
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "), json.errors);
  return json.data as T;
}

export async function adminFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = shopifyDomain();
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token) throw new ShopifyError("Shopify Admin API is not configured");
  const res = await fetch(`https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new ShopifyError(`Admin API HTTP ${res.status}`);
  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new ShopifyError(json.errors.map((e) => e.message).join("; "), json.errors);
  return json.data as T;
}
