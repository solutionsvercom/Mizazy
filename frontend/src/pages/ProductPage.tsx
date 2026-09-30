import { useState, useEffect, useRef } from "react";
import { Product, CartItem } from "../data";
import { useStore } from "../store";

interface ProductPageProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="stars flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/055">
      <button
        className="w-full flex items-center justify-between py-4.5 text-left group"
        style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
        onClick={() => setOpen(!open)}
      >
        <span className="font-display font-600 text-white/85 text-sm group-hover:text-white transition-colors">{title}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-white/35 transition-transform duration-320 flex-shrink-0 ${open ? "rotate-45" : ""}`}>
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <div className={`accordion-content ${open ? "max-h-[3000px] opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

export default function ProductPage({ product, onAddToCart, onBuyNow, onNavigate, onViewProduct }: ProductPageProps) {
  const { products, wishlist, toggleWishlist } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const colorGallery = product.colorImages?.[selectedColor];
  const galleryImages = colorGallery && colorGallery.length > 0 ? colorGallery : product.images;

  useEffect(() => {
    setSelectedColor(0);
    setSelectedImage(0);
  }, [product.id]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const categoryGroup = product.category.split(" / ")[0];
  const related = products
    .filter((p) => p.id !== product.id && p.category.split(" / ")[0] === categoryGroup)
    .slice(0, 4);

  // Sticky bar: show when CTA buttons scroll out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const origin = window.location.hostname.endsWith("mizazy.com") ? "https://mizazy.com" : window.location.origin;
    const url = `${origin}/product/${product.slug || product.id}`;
    const image = /^https?:\/\//.test(product.image) ? product.image : `${origin}${product.image}`;
    const description = product.metaDescription || product.description;
    const restores: (() => void)[] = [];

    const setHead = (selector: string, create: () => HTMLElement, attr: string, value: string) => {
      const existing = document.head.querySelector<HTMLElement>(selector);
      if (existing) {
        const prev = existing.getAttribute(attr);
        restores.push(() => (prev === null ? existing.removeAttribute(attr) : existing.setAttribute(attr, prev)));
        existing.setAttribute(attr, value);
      } else {
        const el = create();
        el.setAttribute(attr, value);
        document.head.appendChild(el);
        restores.push(() => el.remove());
      }
    };
    const setMeta = (key: "name" | "property", name: string, content?: string) => {
      if (!content) return;
      setHead(`meta[${key}="${name}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute(key, name);
        return m;
      }, "content", content);
    };

    const prevTitle = document.title;
    document.title = product.metaTitle || `${product.name} | MIZAZY`;
    setMeta("name", "description", description);
    setMeta("name", "keywords", product.seoKeywords?.join(", "));
    setMeta("property", "og:type", "product");
    setMeta("property", "og:title", product.ogTitle || document.title);
    setMeta("property", "og:description", product.ogDescription || description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", product.imageAlt || product.name);
    setMeta("property", "og:url", url);
    setHead('link[rel="canonical"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    }, "href", url);

    return () => {
      document.title = prevTitle;
      restores.reverse().forEach((restore) => restore());
    };
  }, [product]);

  const handleAddToCart = () => {
    onAddToCart({ product, quantity, color: product.colors[selectedColor], colorName: product.colorNames[selectedColor] });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    onBuyNow({ product, quantity, color: product.colors[selectedColor], colorName: product.colorNames[selectedColor] });
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      const days = parseInt(pincode[0]) % 3 === 0 ? 2 : parseInt(pincode[0]) % 2 === 0 ? 3 : 4;
      const date = new Date();
      date.setDate(date.getDate() + days);
      const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      setDeliveryInfo(`Delivered by ${dateStr} · ${days === 2 ? "Express available" : "Standard Delivery"}`);
    }
  };

  const faqs = [
    ...(product.faqs ?? []),
    { q: "Does this come with warranty?", a: "Yes, all MIZAZY products come with manufacturer's warranty. See the Warranty section for full details." },
    { q: "What is the return policy?", a: "7-day return from delivery date. Product must be in original, unused condition with all accessories." },
    { q: "How long does delivery take?", a: "Standard: 3-5 business days. Express: 1-2 days. Available in 200+ cities across India." },
    { q: "Is EMI available?", a: product.emi ? `Yes — ${product.emi}. Available on Visa, Mastercard, and select bank cards.` : "EMI not available on this product." },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ── Sticky buy bar ── */}
      {showStickyBar && (
        <div className="sticky-buy-bar">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <img src={product.image} alt={product.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-[#111]" />
              <div className="min-w-0">
                <p className="font-display font-700 text-white text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <Stars rating={product.rating} size={10} />
                  <span className="text-white/35 text-xs">{product.reviews.toLocaleString()} reviews</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="mobile-hidden">
                <span className="font-display font-800 text-white text-xl">₹{product.price.toLocaleString()}</span>
                <span className="text-white/25 text-sm line-through ml-2">₹{product.mrp.toLocaleString()}</span>
              </div>
              <button
                onClick={handleAddToCart}
                className={`px-5 py-2 rounded-lg font-display font-700 text-sm tracking-wide uppercase transition-all ${
                  addedToCart ? "bg-[#5DD87A] text-[#050505]" : "bg-white text-[#050505] hover:bg-[#efefef]"
                }`}
              >
                {addedToCart ? "✓ Added" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow}
                className="px-5 py-2 rounded-lg font-display font-700 text-sm tracking-wide uppercase transition-all"
                style={{ background: "linear-gradient(135deg, #D4A520, #F0C030)", color: "#050505" }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2 text-white/25 text-xs font-display">
          <button onClick={() => onNavigate("home")} className="hover:text-white/60 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate("home")} className="hover:text-white/60 transition-colors">{product.category}</button>
          <span>/</span>
          <span className="text-white/50">{product.name}</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* ── LEFT: Gallery ── */}
          <div className="lg:sticky lg:top-24 self-start">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0d0d0d] border border-white/065 aspect-square mb-3 group cursor-zoom-in">
              <img
                src={galleryImages[selectedImage] ?? galleryImages[0]}
                alt={`${product.imageAlt || product.name} ${product.colorNames[selectedColor] ?? ""} view ${selectedImage + 1}`}
                title={product.imageTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top overlays */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                {product.badge && (
                  <span className={`badge ${
                    product.badge === "BEST SELLER" ? "badge-bestseller" :
                    product.badge === "NEW" ? "badge-new" :
                    product.badge === "LIMITED" ? "badge-limited" : "badge-sale"
                  }`}>{product.badge}</span>
                )}
              </div>

              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={() => toggleWishlist(product.id)}
                  className="w-10 h-10 glass rounded-full flex items-center justify-center hover:scale-110 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={wishlist.includes(product.id) ? "#D4A520" : "none"}
                    stroke={wishlist.includes(product.id) ? "#D4A520" : "rgba(255,255,255,0.7)"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {discount > 0 && (
                  <div className="px-2.5 py-1 rounded-lg text-center font-display font-700 text-[11px]"
                    style={{ background: "rgba(212,165,32,0.9)", color: "#050505" }}>
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Image counter */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 glass px-2.5 py-1 rounded-lg">
                  <span className="font-display font-600 text-white/70 text-xs">{selectedImage + 1} / {galleryImages.length}</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 mb-3">
                {galleryImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200"
                    style={{
                      border: `2px solid ${selectedImage === i ? "#D4A520" : "rgba(255,255,255,0.08)"}`,
                      opacity: selectedImage === i ? 1 : 0.6,
                    }}>
                    <img src={img} alt={`View ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Social proof */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/055 bg-white/02">
              <span className="live-dot flex-shrink-0" />
              <p className="text-white/45 text-xs">
                <span className="text-white font-600">
                  {12 + Math.floor(Math.random() * 8)} people
                </span>{" "}
                viewing this right now
              </p>
              <span className="ml-auto flex-shrink-0 text-[#D4A520] text-[10px] font-display font-600">
                {Math.floor(Math.random() * 30) + 10} sold today
              </span>
            </div>
          </div>

          {/* ── RIGHT: Purchase info ── */}
          <div>
            {/* Category label */}
            <p className="section-label mb-3">{product.category}</p>

            {/* Name */}
            <h1 className="font-display font-800 text-3xl sm:text-4xl text-white leading-tight tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-white/45 text-base mb-5">{product.title || product.tagline}</p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-display font-600 text-[#D4A520]"
                    style={{ background: "rgba(212,165,32,0.1)", border: "1px solid rgba(212,165,32,0.25)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-white/055">
              <Stars rating={product.rating} size={15} />
              <span className="font-display font-700 text-white">{product.rating}</span>
              <span className="text-white/30 text-sm">({product.reviews.toLocaleString()} verified reviews)</span>
              <span className="flex items-center gap-1 text-[#5DD87A] text-xs font-display font-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Verified Purchase
              </span>
            </div>

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed mb-6 pl-4 border-l-2 border-[#D4A520]/40">
              {product.description}
            </p>

            {/* Price block */}
            <div className="flex items-end gap-3 mb-1.5">
              <span className="font-display font-900 text-white text-4xl sm:text-5xl">₹{product.price.toLocaleString()}</span>
              <span className="text-white/25 text-xl line-through mb-1">₹{product.mrp.toLocaleString()}</span>
              <span className="mb-1.5 px-2.5 py-0.5 rounded-lg text-sm font-display font-700"
                style={{ background: "rgba(212,165,32,0.15)", color: "#D4A520" }}>
                {discount}% off
              </span>
            </div>

            <div className="flex items-center gap-3 mb-7">
              {product.mrp > product.price && (
                <p className="text-[#D4A520] text-sm font-display font-600">
                  You save ₹{(product.mrp - product.price).toLocaleString()}
                </p>
              )}
              {product.emi && (
                <p className="text-[#D4A520]/70 text-sm">{product.emi}</p>
              )}
              <span className="text-[#5DD87A] text-xs font-display font-600 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                Inclusive of all taxes
              </span>
            </div>

            {/* Color selection */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/55 text-sm font-display font-500">Color</span>
                <span className="text-white font-display font-700 text-sm">{product.colorNames[selectedColor]}</span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button key={i} onClick={() => { setSelectedColor(i); setSelectedImage(0); }}
                    className={`color-swatch ${selectedColor === i ? "selected" : ""}`}
                    style={{ backgroundColor: c, width: 32, height: 32 }}
                    title={product.colorNames[i]}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white/55 text-sm font-display font-500">Qty</span>
              <div className="flex items-center gap-2.5">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="w-8 text-center font-display font-700 text-white text-base">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(Math.min(10, quantity + 1))}>+</button>
              </div>
              <span className="text-[#5DD87A] text-xs font-display font-600">● In Stock</span>
            </div>

            {/* CTA buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-xl font-display font-700 text-sm tracking-widest uppercase transition-all duration-250 ${
                  addedToCart
                    ? "text-[#050505]"
                    : "bg-white text-[#050505] hover:bg-[#efefef] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10"
                }`}
                style={addedToCart ? { background: "#5DD87A" } : {}}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    Added!
                  </span>
                ) : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 rounded-xl font-display font-700 text-sm tracking-widest uppercase transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #D4A520, #F0C030)", color: "#050505", boxShadow: "0 8px 24px rgba(212,165,32,0.25)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 40px rgba(212,165,32,0.4)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(212,165,32,0.25)")}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-2 mb-7">
              {[
                { icon: "🔒", label: "Secure Pay" },
                { icon: "🚀", label: "Fast Delivery" },
                { icon: "↩", label: "7-Day Return" },
                { icon: "✅", label: "Genuine" },
              ].map((b) => (
                <div key={b.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/055 text-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-white/35 text-[9px] font-display font-600">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Delivery estimator */}
            <div className="p-4 rounded-xl border border-white/065 mb-7" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="font-display font-600 text-white/70 text-sm mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4A520" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Check Delivery
              </p>
              <div className="flex gap-2">
                <input
                  className="input-dark flex-1 py-2 text-sm"
                  placeholder="Enter PIN code"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/, "")); setDeliveryInfo(null); }}
                  onKeyDown={(e) => e.key === "Enter" && checkDelivery()}
                />
                <button
                  onClick={checkDelivery}
                  disabled={pincode.length !== 6}
                  className="px-4 py-2 rounded-lg font-display font-600 text-sm transition-all disabled:opacity-40"
                  style={{ border: "1px solid rgba(212,165,32,0.4)", color: "#D4A520", background: "rgba(212,165,32,0.08)" }}
                >
                  Check
                </button>
              </div>
              {deliveryInfo && (
                <p className="text-[#5DD87A] text-xs font-display font-600 mt-2.5 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  {deliveryInfo}
                </p>
              )}
            </div>

            {/* Expandable info */}
            <div>
              <Accordion title="Key Features" defaultOpen>
                <ul className="space-y-2.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/55 text-sm leading-relaxed">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(212,165,32,0.14)" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#D4A520">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                {product.keyFeatures && product.keyFeatures.length > 0 && (
                  <ol className="mt-5 space-y-4">
                    {product.keyFeatures.map((kf, i) => (
                      <li key={i} className="text-sm leading-relaxed">
                        <p className="text-white font-display font-700 mb-1">
                          {i + 1}. {kf.title}
                        </p>
                        <p className="text-white/55">{kf.text}</p>
                        {kf.points && (
                          <ul className="mt-1.5 pl-4 list-disc text-white/55 space-y-0.5">
                            {kf.points.map((pt) => (
                              <li key={pt}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </Accordion>

              <Accordion title="Specifications">
                <div className="space-y-1.5">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start py-1.5 border-b border-white/04 last:border-0 gap-4">
                      <span className="text-white/38 text-xs font-display font-500 flex-shrink-0">{k}</span>
                      <span className="text-white/72 text-xs text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </Accordion>

              {product.infoSections?.map((section) => (
                <Accordion key={section.title} title={section.title}>
                  <div className="space-y-1.5">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex justify-between items-start py-1.5 border-b border-white/04 last:border-0 gap-4">
                        <span className="text-white/38 text-xs font-display font-500 flex-shrink-0">{item.label}</span>
                        <span className="text-white/72 text-xs text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {section.notes && section.notes.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-white/45 text-xs leading-relaxed list-disc pl-4">
                      {section.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}
                </Accordion>
              ))}

              <Accordion title="What's in the Box">
                <ul className="space-y-2">
                  {product.inBox.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-white/55 text-sm">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4A520" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion title="Warranty & Returns">
                <div className="text-white/50 text-sm space-y-2.5 leading-relaxed">
                  <p>{product.warranty || "Manufacturer warranty covers manufacturing defects for the period specified in specifications."}</p>
                  <p>7-day return policy from date of delivery for unused products in original packaging with all accessories.</p>
                  <p>For warranty claims or returns, contact MIZAZY support with your Order ID and proof of purchase.</p>
                </div>
              </Accordion>

              <Accordion title="FAQs">
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="pb-3.5 border-b border-white/04 last:border-0 last:pb-0">
                      <p className="font-display font-600 text-white/80 text-sm mb-1.5">{faq.q}</p>
                      <p className="text-white/42 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="section-label mb-2">From MIZAZY</p>
                <h2 className="font-display font-800 text-3xl text-white">Complete Your Setup</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <div key={p.id} className="product-card group cursor-pointer" onClick={() => onViewProduct(p)}>
                  <div className="card-image-wrap aspect-square bg-[#0d0d0d]">
                    <img src={p.image} alt={p.name} className="card-img w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] font-display font-600 text-white/28 tracking-widest uppercase mb-1">{p.category}</p>
                    <h3 className="font-display font-700 text-white text-sm mb-2">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-800 text-white">₹{p.price.toLocaleString()}</span>
                      <span className="text-white/25 text-xs line-through">₹{p.mrp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
