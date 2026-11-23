import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { ShopifyImage } from "./shopify-image";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product, locale, t, priority }: { product: Product; locale: Locale; t: Dictionary; priority?: boolean }) {
  const img = product.featuredImage ?? product.images[0];
  const second = product.images[1];
  const min = product.priceRange.minVariantPrice;
  const max = product.priceRange.maxVariantPrice;
  const compare = product.compareAtPriceRange?.minVariantPrice;
  const onSale = compare && Number(compare.amount) > Number(min.amount);
  const price = formatMoney(min.amount, min.currencyCode, locale);
  return (
    <article className="group relative">
      <Link href={`/${locale}/products/${product.handle}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          {img ? (
            <>
              <ShopifyImage image={img} alt={product.title} priority={priority} className="h-full w-full object-cover transition-opacity duration-500" />
              {second && (
                <ShopifyImage image={second} alt="" className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block" />
              )}
            </>
          ) : null}
          {!product.availableForSale && (
            <span className="absolute start-2 top-2 bg-white/90 px-2 py-1 text-[0.65rem] uppercase tracking-wider">{t.product.outOfStock}</span>
          )}
        </div>
        <div className="mt-3 space-y-1 pe-8">
          <h3 className="text-sm leading-snug">{product.title}</h3>
          <p className="text-sm">
            {onSale && <s className="me-2 text-stone">{formatMoney(compare!.amount, compare!.currencyCode, locale)}</s>}
            <span className={onSale ? "text-gold-deep" : ""}>{min.amount !== max.amount ? `${price} +` : price}</span>
          </p>
        </div>
      </Link>
      <div className="absolute bottom-0 end-0">
        <WishlistButton item={{ handle: product.handle, title: product.title, image: img?.url, price }} labelAdd={t.product.addToWishlist} labelIn={t.product.inWishlist} />
      </div>
    </article>
  );
}
