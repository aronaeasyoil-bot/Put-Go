import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";
import { CartOpener } from "@/components/cart-opener";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).cart.title, robots: { index: false } } : {};
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-16 text-center">
      <h1 className="mb-8 font-display text-4xl">{t.cart.title}</h1>
      <CartOpener label={t.cart.title} />
    </div>
  );
}
