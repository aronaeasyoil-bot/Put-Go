import "server-only";
import { cookies } from "next/headers";
import { storefrontFetch, isShopifyConfigured } from "./client";
import { CART, PRODUCT } from "./fragments";
import type { Cart, CartLine, Connection, Image, Media, Product, ProductVariant } from "./types";
import { COUNTRY_COOKIE, defaultCountry, isCountry, type CountryCode } from "@/lib/markets";
import type { Locale } from "@/i18n/config";

export { isShopifyConfigured, isShopifyAdminConfigured } from "./client";
export type * from "./types";

type RawProduct = Omit<Product, "images" | "variants" | "media" | "options"> & {
  images: Connection<Image>;
  media: Connection<Media>;
  variants: Connection<ProductVariant>;
  options: { id: string; name: string; optionValues: { name: string }[] }[];
};

type RawCart = Omit<Cart, "lines"> & { lines: Connection<CartLine> };

const nodes = <T,>(c: Connection<T> | undefined | null): T[] => (c ? c.edges.map((e) => e.node) : []);

function reshapeProduct(p: RawProduct): Product {
  return {
    ...p,
    options: p.options.map((o) => ({ id: o.id, name: o.name, values: o.optionValues.map((v) => v.name) })),
    images: nodes(p.images),
    media: nodes(p.media),
    variants: nodes(p.variants),
  };
}

function reshapeCart(c: RawCart): Cart {
  return { ...c, lines: nodes(c.lines) };
}

const LANG: Record<Locale, string> = { fr: "FR", en: "EN", ar: "AR" };

export async function getCountry(): Promise<CountryCode> {
  const store = await cookies();
  const value = store.get(COUNTRY_COOKIE)?.value;
  return isCountry(value) ? value : defaultCountry;
}

async function ctx(locale: Locale) {
  return { country: await getCountry(), language: LANG[locale] };
}

const CTX_ARGS = "$country: CountryCode, $language: LanguageCode";
const CTX = "@inContext(country: $country, language: $language)";

export type SortKey = "featured" | "new" | "price-asc" | "price-desc";

function collectionSort(sort: SortKey) {
  switch (sort) {
    case "new":
      return { sortKey: "CREATED", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false };
  }
}

function productSort(sort: SortKey) {
  switch (sort) {
    case "new":
      return { sortKey: "CREATED_AT", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "RELEVANCE", reverse: false };
  }
}

/**
 * Products of a collection. Returns [] when Shopify is not configured or the
 * collection does not exist — the UI then shows an honest empty state.
 */
export async function getCollectionProducts(
  handle: string,
  locale: Locale,
  opts: { first?: number; sort?: SortKey } = {},
): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];
  const { sortKey, reverse } = collectionSort(opts.sort ?? "featured");
  try {
    const data = await storefrontFetch<{ collection: { products: Connection<RawProduct> } | null }>(
      `query CollectionProducts($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, ${CTX_ARGS}) ${CTX} {
        collection(handle: $handle) {
          products(first: $first, sortKey: $sortKey, reverse: $reverse) { edges { node { ...ProductFields } } }
        }
      }
      ${PRODUCT}`,
      { handle, first: opts.first ?? 48, sortKey, reverse, ...(await ctx(locale)) },
    );
    return nodes(data.collection?.products).map(reshapeProduct);
  } catch (err) {
    console.error("[shopify] getCollectionProducts", handle, err);
    return [];
  }
}

export async function searchProducts(
  locale: Locale,
  opts: { query?: string; first?: number; sort?: SortKey } = {},
): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];
  let { sortKey, reverse } = productSort(opts.sort ?? "featured");
  if (!opts.query && sortKey === "RELEVANCE") {
    sortKey = "CREATED_AT";
    reverse = true;
  }
  try {
    const data = await storefrontFetch<{ products: Connection<RawProduct> }>(
      `query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, ${CTX_ARGS}) ${CTX} {
        products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) { edges { node { ...ProductFields } } }
      }
      ${PRODUCT}`,
      {
        first: opts.first ?? 48,
        query: opts.query || null,
        sortKey,
        reverse,
        ...(await ctx(locale)),
      },
    );
    return nodes(data.products).map(reshapeProduct);
  } catch (err) {
    console.error("[shopify] searchProducts", err);
    return [];
  }
}

export async function getProduct(handle: string, locale: Locale): Promise<Product | null> {
  if (!isShopifyConfigured()) return null;
  try {
    const data = await storefrontFetch<{ product: RawProduct | null }>(
      `query Product($handle: String!, ${CTX_ARGS}) ${CTX} { product(handle: $handle) { ...ProductFields } }
      ${PRODUCT}`,
      { handle, ...(await ctx(locale)) },
    );
    return data.product ? reshapeProduct(data.product) : null;
  } catch (err) {
    console.error("[shopify] getProduct", handle, err);
    return null;
  }
}

export async function getRecommendations(productId: string, locale: Locale): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];
  try {
    const data = await storefrontFetch<{ productRecommendations: RawProduct[] | null }>(
      `query Recs($productId: ID!, ${CTX_ARGS}) ${CTX} { productRecommendations(productId: $productId) { ...ProductFields } }
      ${PRODUCT}`,
      { productId, ...(await ctx(locale)) },
    );
    return (data.productRecommendations ?? []).slice(0, 8).map(reshapeProduct);
  } catch (err) {
    console.error("[shopify] getRecommendations", err);
    return [];
  }
}

/* ------------------------------------------------------------------ cart */

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontFetch<{ cart: RawCart | null }>(
    `query Cart($cartId: ID!) { cart(id: $cartId) { ...CartFields } } ${CART}`,
    { cartId },
  );
  return data.cart ? reshapeCart(data.cart) : null;
}

type UserError = { field: string[] | null; message: string };

function assertNoUserErrors(errors: UserError[] | undefined) {
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[],
  country: CountryCode,
): Promise<Cart> {
  const data = await storefrontFetch<{ cartCreate: { cart: RawCart; userErrors: UserError[] } }>(
    `mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } } } ${CART}`,
    { input: { lines, buyerIdentity: { countryCode: country } } },
  );
  assertNoUserErrors(data.cartCreate.userErrors);
  return reshapeCart(data.cartCreate.cart);
}

export async function addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const data = await storefrontFetch<{ cartLinesAdd: { cart: RawCart; userErrors: UserError[] } }>(
    `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } } } ${CART}`,
    { cartId, lines },
  );
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  return reshapeCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const data = await storefrontFetch<{ cartLinesUpdate: { cart: RawCart; userErrors: UserError[] } }>(
    `mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } } } ${CART}`,
    { cartId, lines },
  );
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  return reshapeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await storefrontFetch<{ cartLinesRemove: { cart: RawCart; userErrors: UserError[] } }>(
    `mutation Remove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } } } ${CART}`,
    { cartId, lineIds },
  );
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  return reshapeCart(data.cartLinesRemove.cart);
}
