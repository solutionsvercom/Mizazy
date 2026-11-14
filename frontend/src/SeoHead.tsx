import { useEffect } from "react";
import { Product } from "./data";
import { applyToDocument, resolvePageMeta } from "./pageMeta.js";
import { useStore } from "./store";

interface SeoHeadProps {
  page: string;
  product: Product | null;
  categorySlug: string | null;
}

function pathFor(page: string, product: Product | null, category: string | null) {
  if (page === "product" && product) return `/product/${product.slug || product.id}`;
  if (page === "category" && category) return `/category/${category}`;
  if (page === "home" || page === "product" || page === "category") return "/";
  return `/${page}`;
}

export default function SeoHead({ page, product, categorySlug }: SeoHeadProps) {
  const { products } = useStore();
  useEffect(() => {
    applyToDocument(resolvePageMeta(pathFor(page, product, categorySlug), products));
  }, [page, product, categorySlug, products]);
  return null;
}
