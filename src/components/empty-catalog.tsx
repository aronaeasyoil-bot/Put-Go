import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export function EmptyCatalog({ text, hint, cta }: { text: string; hint?: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-line bg-white/60 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm">{text}</p>
        {hint && <p className="mt-1 text-xs text-stone">{hint}</p>}
      </div>
      <a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 border border-ink px-4 py-2.5 text-sm hover:bg-ink hover:text-white">
        <WhatsAppIcon className="h-4 w-4" />
        {cta}
      </a>
    </div>
  );
}
