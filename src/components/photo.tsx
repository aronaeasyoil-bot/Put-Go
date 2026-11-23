/* eslint-disable @next/next/no-img-element */
import { photos, photoSrcSet, photoUrl, type PhotoKey } from "@/lib/editorial";

/** Full-bleed editorial photograph (object-cover inside its parent). */
export function Photo({
  name,
  sizes = "100vw",
  ratio,
  priority,
  className = "",
  position = "center",
}: {
  name: PhotoKey;
  sizes?: string;
  ratio?: number;
  priority?: boolean;
  className?: string;
  position?: string;
}) {
  const p = photos[name];
  return (
    <img
      src={photoUrl(p, 1440, ratio ? Math.round(1440 * ratio) : undefined)}
      srcSet={photoSrcSet(p, ratio)}
      sizes={sizes}
      alt={p.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ objectPosition: position }}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
