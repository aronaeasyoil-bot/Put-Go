import { NextResponse, type NextRequest } from "next/server";
import { addCartLines, createCart, getCart, getCountry, isShopifyConfigured, removeCartLines, updateCartLines } from "@/lib/shopify";
import { clientIp, rateLimit } from "@/lib/security";

const CART_COOKIE = "pg_cart";
const cookieOpts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

export async function GET(req: NextRequest) {
  if (!isShopifyConfigured()) return NextResponse.json({ configured: false, cart: null });
  const id = req.cookies.get(CART_COOKIE)?.value;
  if (!id) return NextResponse.json({ configured: true, cart: null });
  try {
    const cart = await getCart(id);
    return NextResponse.json({ configured: true, cart });
  } catch (err) {
    console.error("[cart] get", err);
    return NextResponse.json({ configured: true, cart: null, error: "cart_unavailable" }, { status: 502 });
  }
}

type Body =
  | { action: "add"; merchandiseId: string; quantity: number }
  | { action: "update"; lineId: string; quantity: number }
  | { action: "remove"; lineId: string };

export async function POST(req: NextRequest) {
  if (!isShopifyConfigured()) return NextResponse.json({ configured: false, cart: null }, { status: 503 });
  if (!rateLimit(`cart:${clientIp(req.headers)}`, 60, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const qty = "quantity" in body ? Math.max(0, Math.min(20, Math.floor(Number(body.quantity) || 0))) : 0;
  const cartId = req.cookies.get(CART_COOKIE)?.value;
  try {
    let cart;
    if (body.action === "add") {
      if (typeof body.merchandiseId !== "string" || !body.merchandiseId.startsWith("gid://shopify/ProductVariant/") || qty < 1) {
        return NextResponse.json({ error: "invalid_line" }, { status: 400 });
      }
      const line = { merchandiseId: body.merchandiseId, quantity: qty };
      cart = cartId ? await addCartLines(cartId, [line]).catch(() => null) : null;
      if (!cart) cart = await createCart([line], await getCountry());
    } else if (body.action === "update" && cartId && typeof body.lineId === "string") {
      cart = qty === 0 ? await removeCartLines(cartId, [body.lineId]) : await updateCartLines(cartId, [{ id: body.lineId, quantity: qty }]);
    } else if (body.action === "remove" && cartId && typeof body.lineId === "string") {
      cart = await removeCartLines(cartId, [body.lineId]);
    } else {
      return NextResponse.json({ error: "invalid_action" }, { status: 400 });
    }
    const res = NextResponse.json({ configured: true, cart });
    res.cookies.set(CART_COOKIE, cart.id, cookieOpts);
    return res;
  } catch (err) {
    console.error("[cart] mutate", err);
    return NextResponse.json({ error: "cart_error" }, { status: 502 });
  }
}
