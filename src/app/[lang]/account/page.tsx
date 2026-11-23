import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { hasLocale } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).account.title, robots: { index: false } } : {};
}

/**
 * Customer accounts and order history are provided by Shopify's hosted
 * customer accounts (secure login, orders, addresses). Set
 * SHOPIFY_ACCOUNT_URL to the store's account URL.
 */
export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const accountUrl = process.env.SHOPIFY_ACCOUNT_URL;
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-16 text-center">
      <h1 className="font-display text-4xl">{t.account.title}</h1>
      <div className="gold-rule my-8" />
      {accountUrl ? (
        <>
          <p className="text-sm text-stone">{t.account.text}</p>
          <a href={accountUrl} className="mt-8 inline-block bg-ink px-8 py-4 text-sm uppercase tracking-wider text-white">{t.account.login}</a>
        </>
      ) : (
        <p className="text-sm text-stone">{t.account.unavailable}</p>
      )}
    </div>
  );
}
