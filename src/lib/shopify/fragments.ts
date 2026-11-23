export const IMAGE = /* GraphQL */ `
  fragment ImageFields on Image { url altText width height }
`;

export const PRODUCT = /* GraphQL */ `
  fragment ProductFields on Product {
    id handle title description descriptionHtml productType vendor tags
    availableForSale createdAt updatedAt
    options { id name optionValues { name } }
    priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    featuredImage { ...ImageFields }
    images(first: 12) { edges { node { ...ImageFields } } }
    media(first: 12) {
      edges { node {
        mediaContentType
        ... on MediaImage { image { ...ImageFields } }
        ... on Video { sources { url mimeType } previewImage { ...ImageFields } }
        ... on ExternalVideo { previewImage { ...ImageFields } }
      } }
    }
    variants(first: 100) {
      edges { node {
        id title availableForSale
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { ...ImageFields }
      } }
    }
    seo { title description }
  }
  ${IMAGE}
`;

export const CART = /* GraphQL */ `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) {
      edges { node {
        id quantity
        cost { totalAmount { amount currencyCode } }
        merchandise { ... on ProductVariant {
          id title selectedOptions { name value }
          image { ...ImageFields }
          product { handle title }
        } }
      } }
    }
  }
  ${IMAGE}
`;
