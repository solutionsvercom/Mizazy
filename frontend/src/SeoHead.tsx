import { useEffect } from "react";
import { Product } from "./data";
import { applyToDocument, resolvePageMeta } from "./pageMeta.js";
import { useStore } from "./store";

interface SeoHeadProps {
  page: string;
  product: Product | null;
  categorySlug: string | null;
  blogSlug: string | null;
}

function pathFor(page: string, product: Product | null, category: string | null, blogSlug: string | null) {
  if (page === "product" && product) return `/product/${product.slug || product.id}`;
  if (page === "category" && category) return `/category/${category}`;
  if (page === "blog") return blogSlug ? `/blog/${blogSlug}` : "/blog";
  if (page === "home" || page === "product" || page === "category") return "/";
  return `/${page}`;
}

export default function SeoHead({ page, product, categorySlug, blogSlug }: SeoHeadProps) {
  const { products } = useStore();
  useEffect(() => {
    applyToDocument(resolvePageMeta(pathFor(page, product, categorySlug, blogSlug), products));
  }, [page, product, categorySlug, blogSlug, products]);
  return null;
}
