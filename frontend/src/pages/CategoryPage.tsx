import { Product, CartItem } from "../data";
import { categorySlug, productMatchesCategory } from "../categories";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";
import { categorySeo } from "../pageMeta.js";
import { guideForCategory } from "../blogPosts.js";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenBlog: (slug: string | null) => void;
}

export default function CategoryPage({ slug, onNavigate, onViewProduct, onAddToCart, onOpenBlog }: CategoryPageProps) {
  const { categories, products } = useStore();
  const category = categories.find((c) => categorySlug(c.name) === slug);
  const title = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const matches = products.filter((p) => productMatchesCategory(p, title));
  const seo = categorySeo(slug);
  const guide = guideForCategory(slug);
  const heading = seo?.h1 || title;
  const openProduct = (href: string) => {
    const product = products.find((item) => `/product/${item.slug || item.id}` === href);
    if (product) onViewProduct(product);
  };

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <button onClick={() => onNavigate("home")} className="text-white/40 hover:text-white text-sm mb-8 transition-colors">
          ← Back to home
        </button>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-white/35 mb-4">
          <a href="/" onClick={(event) => { event.preventDefault(); onNavigate("home"); }} className="hover:text-[#D4A520]">Home</a>
          <span>/</span>
          <span className="text-white/60">{heading}</span>
        </nav>
        <p className="section-label mb-2">Shop by Category</p>
        <h1 className="section-heading text-4xl sm:text-5xl text-white mb-4">{heading}</h1>
        {seo?.intro && (
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-3xl mb-4">
            {seo.intro.map((part, index) => part.href ? (
              <a
                key={part.href}
                href={part.href}
                onClick={(event) => { event.preventDefault(); openProduct(part.href); }}
                className="text-[#D4A520] hover:underline"
              >
                {part.text}
              </a>
            ) : (
              <span key={index}>{part.text}</span>
            ))}
          </p>
        )}
        {guide && (
          <p className="text-white/55 text-sm mb-6 max-w-3xl">
            From the blog:{" "}
            <a
              href={`/blog/${guide.slug}`}
              onClick={(event) => { event.preventDefault(); onOpenBlog(guide.slug); }}
              className="text-[#D4A520] hover:underline"
            >
              {guide.title}
            </a>
          </p>
        )}
        <p className="text-white/40 mb-10">
          {matches.length === 1 ? "1 product" : `${matches.length} products`}
        </p>

        {matches.length === 0 ? (
          <p className="text-white/45 text-sm">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                productHref={`/product/${p.slug || p.id}`}
                onViewProduct={onViewProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {seo?.faqs && seo.faqs.length > 0 && (
          <section className="mt-12 max-w-3xl border-t border-white/8 pt-8">
            <h2 className="font-display font-700 text-xl text-white mb-4">Questions about this category</h2>
            <div className="space-y-5">
              {seo.faqs.map((item) => (
                <div key={item.question}>
                  <h3 className="text-white font-display font-600 text-base mb-1">{item.question}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
