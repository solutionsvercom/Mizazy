import { useState } from "react";
import { Product, CartItem } from "../data";
import { useStore } from "../store";

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
}

export function BadgeEl({ badge }: { badge: Product["badge"] }) {
  if (!badge) return null;
  const cls =
    badge === "BEST SELLER" ? "badge-bestseller" :
    badge === "NEW" ? "badge-new" :
    badge === "LIMITED" ? "badge-limited" : "badge-sale";
  return <span className={`badge ${cls}`}>{badge}</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductCard({ product, onViewProduct, onAddToCart }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useStore();
  const wishlisted = wishlist.includes(product.id);
  const [hovered, setHovered] = useState(false);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div
      className="product-card"
      onClick={() => onViewProduct(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="card-image-wrap bg-[#0d0d0d]" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={product.image}
          alt={product.name}
          className="card-img w-full h-full object-cover"
          loading="lazy"
        />

        {/* Gradient overlay — always there, deepens on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-400 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.1) 40%, transparent 70%)",
            opacity: hovered ? 1 : 0.6,
          }}
        />

        {/* Top row: badge + wishlist */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          {product.badge ? (
            <BadgeEl badge={product.badge} />
          ) : (
            <div />
          )}
          <button
            className="wishlist-btn w-8 h-8 glass rounded-full flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            aria-label="Wishlist"
          >
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={wishlisted ? "#D4A520" : "none"}
              stroke={wishlisted ? "#D4A520" : "rgba(255,255,255,0.7)"}
              strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Discount pill */}
        {discount > 0 && (
          <div className="absolute top-12 right-3 z-10">
            <span className="text-[10px] font-display font-700 px-2 py-0.5 rounded"
              style={{ background: "rgba(212,165,32,0.9)", color: "#050505" }}>
              -{discount}%
            </span>
          </div>
        )}

        {/* Bottom: quick-action buttons — slide up on hover */}
        <div className="quick-actions absolute bottom-0 left-0 right-0 p-3 flex gap-2 z-10">
          <button
            className="flex-1 py-2 text-[10px] font-display font-600 tracking-widest uppercase glass-strong rounded-lg text-white transition-all hover:bg-white/12"
            onClick={(e) => { e.stopPropagation(); onViewProduct(product); }}
          >
            Quick View
          </button>
          <button
            className="flex-1 py-2 text-[10px] font-display font-700 tracking-widest uppercase bg-white text-[#050505] rounded-lg transition-all hover:bg-[#efefef] active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart({ product, quantity: 1, color: product.colors[0], colorName: product.colorNames[0] });
            }}
          >
            Add to Cart
          </button>
        </div>

        {/* In-stock indicator */}
        <div className="absolute bottom-14 left-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s 0.1s" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5DD87A]" />
          <span className="text-[#5DD87A] text-[9px] font-display font-600">In Stock</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        {/* Category */}
        <p className="text-[9px] font-display font-600 text-white/30 tracking-[0.18em] uppercase mb-1.5">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-display font-700 text-white text-[0.95rem] leading-tight mb-1">
          {product.name}
        </h3>

        {/* Tagline */}
        <p className="text-white/35 text-[11px] mb-3 line-clamp-1">{product.tagline}</p>

        {/* Rating + reviews */}
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={product.rating} />
          <span className="text-white/50 text-[11px] font-display font-600">{product.rating}</span>
          <span className="text-white/22 text-[11px]">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5 mb-3.5">
          {product.colors.map((c, i) => (
            <div
              key={i}
              className="color-swatch"
              style={{ backgroundColor: c }}
              title={product.colorNames[i]}
            />
          ))}
        </div>

        {/* Price row */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-800 text-white text-[1.1rem]">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-white/25 text-xs line-through">
              ₹{product.mrp.toLocaleString()}
            </span>
          </div>
          {product.emi && (
            <span className="text-[#D4A520] text-[9px] font-display font-600">EMI avail.</span>
          )}
        </div>
      </div>
    </div>
  );
}
