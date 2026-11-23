"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { departments, mainNav } from "@/lib/catalog-structure";
import { SITE } from "@/lib/site";
import { useCart, useWishlist } from "./providers";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon, WhatsAppIcon } from "./icons";
import { CartDrawer } from "./cart-drawer";

export function Header({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, setOpen } = useCart();
  const { items } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close overlays on navigation
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const switchTo = (l: Locale) => pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, `/${l}`);
  const qty = cart?.totalQuantity ?? 0;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:bg-white focus:px-3 focus:py-2">
        {t.common.skipToContent}
      </a>
      <div className="bg-ink-soft text-[0.7rem] text-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <span className="truncate">{t.footer.shipsFrom}</span>
          <div className="flex shrink-0 items-center gap-3">
            {locales.map((l) => (
              <Link key={l} href={switchTo(l)} hrefLang={l} className={l === locale ? "text-gold" : "hover:text-white"} aria-current={l === locale ? "true" : undefined}>
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMenuOpen(true)} className="-ms-2 p-2 lg:hidden" aria-label={t.common.menu} aria-expanded={menuOpen}>
              <MenuIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => setSearchOpen((v) => !v)} className="p-2" aria-label={t.common.search} aria-expanded={searchOpen}>
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
          <Link href={`/${locale}`} className="block" aria-label="PUT & GO">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logoCrop} alt="PUT & GO" width={360} height={480} className="h-[62px] w-auto mix-blend-lighten" />
          </Link>
          <div className="flex items-center justify-end gap-0.5">
            <Link href={`/${locale}/account`} className="hidden p-2 sm:block" aria-label={t.common.account}>
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link href={`/${locale}/wishlist`} className="relative p-2" aria-label={t.common.wishlist}>
              <HeartIcon className="h-5 w-5" />
              {items.length > 0 && <span className="absolute end-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-gold" />}
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="relative -me-2 p-2" aria-label={`${t.common.cart} (${qty})`}>
              <BagIcon className="h-5 w-5" />
              {qty > 0 && (
                <span className="absolute end-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-medium text-ink">{qty}</span>
              )}
            </button>
          </div>
        </div>
        <nav aria-label="Main" className="hidden border-t border-white/10 lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4">
            {mainNav.map((key) => (
              <li key={key} className="group relative">
                <Link
                  href={`/${locale}/shop/${key}`}
                  className={`eyebrow block py-3 transition-colors hover:text-gold ${pathname.includes(`/shop/${key}`) ? "text-gold" : "text-white/85"} ${key === "sale" ? "text-gold-light" : ""}`}
                >
                  {t.nav[key]}
                </Link>
                {(() => {
                  const subs = departments.find((d) => d.key === key)?.subs ?? [];
                  if (!subs.length) return null;
                  return (
                    <div className="invisible absolute start-1/2 top-full z-50 w-56 -translate-x-1/2 bg-paper p-5 text-ink opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 rtl:translate-x-1/2">
                      <ul className="space-y-2 text-sm">
                        {subs.map((s) => (
                          <li key={s}>
                            <Link href={`/${locale}/shop/${key}?sub=${s}`} className="hover:text-gold-deep">{t.sub[s]}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </li>
            ))}
          </ul>
        </nav>
        {searchOpen && (
          <form
            role="search"
            className="border-t border-white/10 bg-ink"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              if (q) router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
              <SearchIcon className="h-5 w-5 text-gold" />
              <input
                name="q"
                autoFocus
                type="search"
                placeholder={t.common.searchPlaceholder}
                aria-label={t.common.search}
                className="w-full bg-transparent py-2 text-base text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </form>
        )}
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${menuOpen ? "" : "pointer-events-none invisible"}`} aria-hidden={!menuOpen}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-paper transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label={t.common.menu}
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logoCrop} alt="PUT & GO" width={360} height={480} className="h-12 w-auto mix-blend-lighten" />
            <button type="button" onClick={() => setMenuOpen(false)} className="p-2" aria-label={t.common.close}>
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <ul className="divide-y divide-line px-5">
            {mainNav.map((key) => {
              const subs = departments.find((d) => d.key === key)?.subs ?? [];
              return (
                <li key={key} className="py-1">
                  {subs.length ? (
                    <details>
                      <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-display text-2xl">{t.nav[key]}<span className="text-gold">+</span></summary>
                      <ul className="mb-3 grid grid-cols-2 gap-2 ps-1 text-sm text-stone">
                        <li className="col-span-2"><Link href={`/${locale}/shop/${key}`} className="text-ink underline underline-offset-4">{t.common.viewAll}</Link></li>
                        {subs.map((s) => (
                          <li key={s}><Link href={`/${locale}/shop/${key}?sub=${s}`} className="block py-1">{t.sub[s]}</Link></li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link href={`/${locale}/shop/${key}`} className={`block py-3 font-display text-2xl ${key === "sale" ? "text-gold-deep" : ""}`}>{t.nav[key]}</Link>
                  )}
                </li>
              );
            })}
            <li className="py-1"><Link href={`/${locale}/shop/best-sellers`} className="block py-3 font-display text-2xl">{t.nav["best-sellers"]}</Link></li>
          </ul>
          <div className="mt-auto space-y-3 border-t border-line p-5 text-sm">
            <Link href={`/${locale}/account`} className="flex items-center gap-3"><UserIcon className="h-5 w-5" />{t.common.account}</Link>
            <a href={SITE.whatsappCatalogUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><WhatsAppIcon className="h-5 w-5 text-[#25D366]" />{t.common.whatsappCatalog}</a>
            <div className="flex gap-4 pt-2">
              {locales.map((l) => (
                <Link key={l} href={switchTo(l)} hrefLang={l} className={l === locale ? "font-medium text-gold-deep" : "text-stone"}>{localeNames[l]}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CartDrawer locale={locale} t={t} />
    </>
  );
}
