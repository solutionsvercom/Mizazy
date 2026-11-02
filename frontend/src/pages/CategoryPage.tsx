import { Product, CartItem } from "../data";
import { categorySlug, productMatchesCategory } from "../categories";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
}

export default function CategoryPage({ slug, onNavigate, onViewProduct, onAddToCart }: CategoryPageProps) {
  const { categories, products } = useStore();
  const category = categories.find((c) => categorySlug(c.name) === slug);
  const title = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const matches = products.filter((p) => productMatchesCategory(p, title));

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <button onClick={() => onNavigate("home")} className="text-white/40 hover:text-white text-sm mb-8 transition-colors">
          ← Back to home
        </button>
        <p className="section-label mb-2">Shop by Category</p>
        <h1 className="section-heading text-4xl sm:text-5xl text-white mb-3">{title}</h1>
        <p className="text-white/40 mb-10">
          {matches.length === 1 ? "1 product" : `${matches.length} products`}
        </p>

        {matches.length === 0 ? (
          <p className="text-white/45 text-sm">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
