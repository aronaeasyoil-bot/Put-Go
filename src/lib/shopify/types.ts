export type Money = { amount: string; currencyCode: string };
export type Image = { url: string; altText: string | null; width?: number | null; height?: number | null };
export type VideoSource = { url: string; mimeType: string };
export type Media =
  | { mediaContentType: "IMAGE"; image: Image }
  | { mediaContentType: "VIDEO"; sources: VideoSource[]; previewImage: Image | null }
  | { mediaContentType: "EXTERNAL_VIDEO" | "MODEL_3D"; previewImage: Image | null };

export type ProductOption = { id: string; name: string; values: string[] };
export type SelectedOption = { name: string; value: string };

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
  options: ProductOption[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  featuredImage: Image | null;
  images: Image[];
  media: Media[];
  variants: ProductVariant[];
  seo: { title: string | null; description: string | null };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    image: Image | null;
    product: { handle: string; title: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: CartLine[];
};

export type Connection<T> = { edges: { node: T }[] };
