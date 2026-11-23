"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

const KEY = "pg_consent";

/**
 * Consent banner. Analytics (Cloudflare Web Analytics, cookieless) is only
 * loaded after explicit acceptance and only when a beacon token is configured.
 */
export function CookieConsent({ locale, t, analyticsToken }: { locale: Locale; t: Dictionary["cookies"]; analyticsToken?: string }) {
  const [choice, setChoice] = useState<"accepted" | "declined" | null | undefined>(undefined);
  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(KEY); } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read stored consent once on mount
    setChoice(v === "accepted" || v === "declined" ? v : null);
  }, []);
  const decide = (v: "accepted" | "declined") => {
    try { localStorage.setItem(KEY, v); } catch {}
    setChoice(v);
  };
  return (
    <>
      {choice === "accepted" && analyticsToken && (
        <Script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: analyticsToken })} strategy="afterInteractive" />
      )}
      {choice === null && (
        <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl bg-ink p-5 text-sm text-white shadow-2xl sm:inset-x-auto sm:start-4">
          <p className="text-white/85">{t.text} <Link href={`/${locale}/cookies`} className="underline">{t.more}</Link></p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => decide("accepted")} className="bg-gold px-5 py-2.5 text-ink">{t.accept}</button>
            <button type="button" onClick={() => decide("declined")} className="border border-white/40 px-5 py-2.5">{t.decline}</button>
          </div>
        </div>
      )}
    </>
  );
}
