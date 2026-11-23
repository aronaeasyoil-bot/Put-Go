/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toBase64(bytes: ArrayBuffer): string {
  let bin = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

/** Verifies the X-Shopify-Hmac-Sha256 header of a webhook (HMAC-SHA256 of the raw body, base64). */
export async function verifyShopifyWebhook(rawBody: string, hmacHeader: string | null, secret: string | undefined): Promise<boolean> {
  if (!hmacHeader || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return safeEqual(toBase64(sig), hmacHeader.trim());
}

/**
 * Best-effort per-isolate rate limiter. Cloudflare's WAF rate limiting rules
 * should be used in front of the site for strong guarantees.
 */
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

/** Admin access for the import-review tool: requires the IMPORT_ADMIN_TOKEN secret. */
export function isAdminRequest(headers: Headers): boolean {
  const token = process.env.IMPORT_ADMIN_TOKEN;
  if (!token || token.length < 24) return false;
  const auth = headers.get("authorization") || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return safeEqual(provided, token);
}
