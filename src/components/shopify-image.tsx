/* eslint-disable @next/next/no-img-element */
import type { Image } from "@/lib/shopify/types";

const WIDTHS = [320, 480, 640, 828, 1080, 1440];

function sized(url: string, w: number) {
  try {
    const u = new URL(url);
    u.searchParams.set("width", String(w));
    return u.toString();
  } catch {
    return url;
  }
}

/** Responsive image served by Shopify's CDN (which resizes and converts to WebP/AVIF). */
export function ShopifyImage({
  image,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className,
  priority,
}: {
  image: Image;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={sized(image.url, 828)}
      srcSet={WIDTHS.map((w) => `${sized(image.url, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={image.altText || alt}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
