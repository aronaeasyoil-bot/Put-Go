"use client";

import { useState } from "react";
import type { Media } from "@/lib/shopify/types";

function src(url: string, w: number) {
  try { const u = new URL(url); u.searchParams.set("width", String(w)); return u.toString(); } catch { return url; }
}

/** Swipeable gallery (CSS scroll-snap on mobile, stacked grid on desktop). */
export function ProductGallery({ media, title }: { media: Media[]; title: string }) {
  const [index, setIndex] = useState(0);
  const items = media.filter((m) => m.mediaContentType === "IMAGE" || (m.mediaContentType === "VIDEO" && m.sources.length));
  if (!items.length) return <div className="aspect-[3/4] bg-cream" />;
  const render = (m: Media, i: number) =>
    m.mediaContentType === "IMAGE" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src(m.image.url, 1080)} srcSet={[480, 828, 1080, 1440].map((w) => `${src(m.image.url, w)} ${w}w`).join(", ")} sizes="(min-width: 1024px) 30vw, 100vw" alt={m.image.altText || `${title} — ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
    ) : m.mediaContentType === "VIDEO" ? (
      <video controls playsInline muted preload="metadata" poster={m.previewImage?.url} className="h-full w-full object-cover">
        {m.sources.slice(0, 3).map((s) => <source key={s.url} src={s.url} type={s.mimeType} />)}
      </video>
    ) : null;
  return (
    <div>
      <div
        onScroll={(e) => setIndex(Math.round(Math.abs(e.currentTarget.scrollLeft) / e.currentTarget.clientWidth))}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible"
      >
        {items.map((m, i) => (
          <div key={i} className="aspect-[3/4] w-full shrink-0 snap-center bg-cream lg:w-auto">{render(m, i)}</div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
          {items.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all ${i === index ? "w-6 bg-ink" : "w-2 bg-line"}`} />)}
        </div>
      )}
    </div>
  );
}
