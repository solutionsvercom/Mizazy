import { Product } from "./data";

export function categorySlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productMatchesCategory(product: Product, categoryName: string) {
  const name = categoryName.toLowerCase();
  const category = product.category.toLowerCase();
  if (name.includes("earbud")) return category.includes("earbud");
  if (name.includes("neckband")) return category.includes("neckband");
  if (name.includes("charger")) return category.includes("charger");
  if (name.includes("cable")) return category.includes("cable");
  return category.includes(name);
}
