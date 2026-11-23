import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { WishlistView } from "@/components/wishlist-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/wishlist">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).wishlist.title, robots: { index: false } } : {};
}

export default async function WishlistPage({ params }: PageProps<"/[lang]/wishlist">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      <h1 className="mb-10 font-display text-4xl">{t.wishlist.title}</h1>
      <WishlistView locale={lang} t={t} />
    </div>
  );
}
