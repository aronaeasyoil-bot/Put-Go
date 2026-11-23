/**
 * Proposed navigation structure. Each department maps to a Shopify collection
 * with the same handle; sub-categories filter on the Shopify product type
 * (or a "sub:<key>" product tag). Departments are only populated with real
 * products published in Shopify.
 */
export const departments = [
  {
    key: "women",
    subs: ["dresses", "tops", "shirts", "trousers", "jeans", "skirts", "jackets", "traditional", "shoes", "handbags", "accessories"],
  },
  {
    key: "men",
    subs: ["t-shirts", "polos", "shirts", "trousers", "jeans", "jackets", "suits", "traditional", "shoes", "accessories"],
  },
  {
    key: "kids",
    subs: ["girls", "boys", "baby", "sets", "dresses", "trousers", "t-shirts", "shoes", "accessories"],
  },
  { key: "shoes", subs: [] },
  { key: "accessories", subs: ["handbags", "accessories"] },
  { key: "new-arrivals", subs: [] },
  { key: "best-sellers", subs: [] },
  { key: "collections", subs: [] },
  { key: "sale", subs: [] },
] as const;

export type DepartmentKey = (typeof departments)[number]["key"];
export type SubKey =
  | "dresses" | "tops" | "shirts" | "trousers" | "jeans" | "skirts" | "jackets" | "shoes"
  | "handbags" | "accessories" | "t-shirts" | "polos" | "suits" | "girls" | "boys" | "baby"
  | "sets" | "traditional";

export const mainNav: DepartmentKey[] = ["new-arrivals", "women", "men", "kids", "shoes", "accessories", "sale"];

export function isDepartment(value: string): value is DepartmentKey {
  return departments.some((d) => d.key === value);
}

export function getDepartment(key: DepartmentKey) {
  return departments.find((d) => d.key === key)!;
}
