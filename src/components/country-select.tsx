"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COUNTRY_COOKIE, defaultCountry, isCountry, markets, type CountryCode } from "@/lib/markets";
import type { Locale } from "@/i18n/config";

export function CountrySelect({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [value, setValue] = useState<CountryCode>(defaultCountry);
  useEffect(() => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COUNTRY_COOKIE}=([A-Z]{2})`));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with cookie after hydration
    if (m && isCountry(m[1])) setValue(m[1]);
  }, []);
  return (
    <label className="flex max-w-xs flex-col gap-1 text-xs">
      <span className="eyebrow text-white/50">{label}</span>
      <select
        value={value}
        className="border border-white/20 bg-ink px-3 py-2 text-sm text-white"
        onChange={async (e) => {
          const next = e.target.value as CountryCode;
          setValue(next);
          await fetch("/api/country", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: next }) });
          router.refresh();
        }}
      >
        {markets.map((m) => (
          <option key={m.code} value={m.code}>{m.label[locale]} ({m.currency})</option>
        ))}
      </select>
    </label>
  );
}
