import { useState, useEffect, useRef } from "react";
import { Product } from "../data";
import { useStore } from "../store";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onViewProduct: (product: Product) => void;
}

const trending = [
  "Wireless earbuds",
  "Power bank",
  "Fast charger",
  "Travel gadgets",
  "Gadgets under ₹2000",
  "Best gadget for office",
];

const popularCategories = ["Audio", "Power", "Smart Gadgets", "Desk Setup", "Mobile Accessories"];

export default function SearchOverlay({ open, onClose, onViewProduct }: SearchOverlayProps) {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
    setResults(filtered);
  }, [query, products]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 max-w-2xl w-full mx-auto mt-16 px-4">
        {/* Input */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gadgets, accessories, audio, power..."
            className="w-full pl-12 pr-12 py-4 bg-[#111] border border-white/10 rounded-xl text-white text-base placeholder-white/30 focus:outline-none focus:border-[#D4A520]/50 focus:bg-[#151515] transition-all font-body"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Results panel */}
        <div className="mt-2 bg-[#0e0e0e] border border-white/08 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="font-display font-600 text-white/40">No results for "{query}"</p>
              <p className="text-white/25 text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-3">
              <p className="section-label px-3 pb-2">{results.length} Result{results.length !== 1 ? "s" : ""}</p>
              {results.map((p) => {
                const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                return (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-white/04 transition-all text-left group"
                    onClick={() => {
                      onViewProduct(p);
                      onClose();
                    }}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#111] flex-shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-600 text-white text-sm">{p.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{p.tagline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display font-700 text-white text-sm">₹{p.price.toLocaleString()}</span>
                        <span className="text-white/25 text-xs line-through">₹{p.mrp.toLocaleString()}</span>
                        <span className="text-[#D4A520] text-[10px] font-600">{discount}% off</span>
                      </div>
                    </div>
                    <svg width="14" height="14" className="text-white/25 group-hover:text-white/60 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="p-5 space-y-6">
              {/* Trending */}
              <div>
                <p className="section-label mb-3">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="px-3 py-1.5 rounded-full border border-white/08 bg-white/03 hover:bg-white/06 hover:border-white/15 text-white/60 hover:text-white text-xs font-display font-500 transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="section-label mb-3">Popular Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {popularCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuery(cat)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/03 border border-white/05 hover:border-white/12 hover:bg-white/05 text-white/70 hover:text-white text-sm font-display font-500 transition-all text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A520]" />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
