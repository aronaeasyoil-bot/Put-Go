"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n";

export function NewsletterForm({ t }: { t: Dictionary["newsletter"] }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  return (
    <form
      className="w-full max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setState("busy");
        const r = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: fd.get("email"), website: fd.get("website") }),
        }).catch(() => null);
        setState(r?.ok ? "ok" : "error");
      }}
    >
      <div className="flex border-b border-current">
        <label htmlFor="nl-email" className="sr-only">{t.placeholder}</label>
        <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder={t.placeholder} className="w-0 min-w-0 flex-1 bg-transparent py-3 text-base placeholder:opacity-50 focus:outline-none" />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button type="submit" disabled={state === "busy"} className="eyebrow shrink-0 ps-4 hover:text-gold">{t.submit}</button>
      </div>
      <p className="mt-2 text-xs opacity-60">{t.consent}</p>
      <p role="status" className="mt-2 text-sm">
        {state === "ok" && t.success}
        {state === "error" && t.error}
      </p>
    </form>
  );
}
