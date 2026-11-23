import { NextResponse, type NextRequest } from "next/server";
import { COUNTRY_COOKIE, isCountry } from "@/lib/markets";

export async function POST(req: NextRequest) {
  const { country } = (await req.json().catch(() => ({}))) as { country?: string };
  if (!isCountry(country)) return NextResponse.json({ error: "invalid_country" }, { status: 400 });
  const res = NextResponse.json({ ok: true, country });
  res.cookies.set(COUNTRY_COOKIE, country, { sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
