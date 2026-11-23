import { SITE } from "@/lib/site";

type Tone = "noir" | "sand" | "gold" | "ivory";

const tones: Record<Tone, string> = {
  noir: "bg-[radial-gradient(120%_90%_at_20%_10%,#2a2418_0%,#0b0b0b_55%)] text-white",
  sand: "bg-[radial-gradient(120%_90%_at_80%_0%,#efe3cb_0%,#d8c6a3_60%,#b89c6c_100%)] text-ink",
  gold: "bg-[linear-gradient(135deg,#9a7426_0%,#e8c96f_45%,#c9a24b_70%,#6f5216_100%)] text-ink",
  ivory: "bg-[radial-gradient(120%_90%_at_30%_20%,#ffffff_0%,#f2ede4_60%,#e4ded3_100%)] text-ink",
};

/**
 * Temporary editorial visual used until official PUT & GO photography is
 * provided. It is labelled as such and never represents purchasable stock.
 */
export function EditorialPanel({
  tone = "noir",
  label,
  title,
  children,
  className = "",
  monogram = true,
}: {
  tone?: Tone;
  label: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  monogram?: boolean;
}) {
  return (
    <div className={`relative isolate flex overflow-hidden ${tones[tone]} ${className}`} role="img" aria-label={title ? `${title} — ${label}` : label}>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(45deg,currentColor_0_1px,transparent_1px_14px)]" />
      {monogram && tone === "noir" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={SITE.logoCrop} alt="" aria-hidden className="pointer-events-none absolute -bottom-6 end-[-6%] h-[70%] w-auto opacity-30 mix-blend-lighten" />
      )}
      <div className="relative z-10 flex w-full flex-col justify-end p-6 sm:p-8">{children}</div>
      <span className="absolute start-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[0.6rem] uppercase tracking-wider text-white/85 backdrop-blur">
        {label}
      </span>
    </div>
  );
}
