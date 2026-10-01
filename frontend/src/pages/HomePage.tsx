import { useState, useRef, useEffect } from "react";
import React from "react";
import { MIZAZY_LOGO_URL, MIZAZY_HERO_BUDS_URL, MIZAZY_GREEN_BUDS_URL } from "../brand";
import { optimizeImage } from "../media";
import LazyVideo from "../components/LazyVideo";
import { whyMizazy, Product, CartItem } from "../data";
import { useStore } from "../store";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

interface HomePageProps {
  onViewProduct: (product: Product) => void;
  onAddToCart: (item: CartItem) => void;
  onNavigate: (page: string) => void;
}

/* ── Scroll reveal hook ───── */
function useReveal(ref: React.RefObject<HTMLElement | null>, threshold = 0.12) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return visible;
}

function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── Stars ───────────────── */
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
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

/* ── Why icon ────────────── */
function WhyIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ReactElement> = {
    shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    zap: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    lock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    truck: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    headphones: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  };
  return map[icon] || null;
}

/* ═══════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
function Hero({ onShop }: { onShop: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const trustItems = [
    "★ 4.8 Average Rating", "12.2K+ Happy Customers", "Free Delivery on ₹999+",
    "1 Year Warranty", "7-Day Returns", "200+ Cities Covered",
    "BIS Certified Products", "EMI Available on All Orders", "Secure Payments",
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#050505]">
      {/* Multi-layer background glows */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,165,32,0.07) 0%, transparent 65%)" }} />
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(120,120,200,0.04) 0%, transparent 65%)" }} />
        <div className="absolute top-[40%] left-[40%] w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />
      </div>

      {/* Main content */}
      <div className="relative flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-16 pb-8 min-h-[90vh]">

        {/* LEFT: Editorial copy */}
        <div className="order-2 lg:order-1 flex flex-col justify-center">
          {/* Tag */}
          <div className={`flex items-center gap-2.5 mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.1s" }}>
            <span className="live-dot" />
            <span className="section-label">New Collection 2026</span>
          </div>

          {/* Hero headline — word by word reveal */}
          <div className="mb-8 overflow-hidden">
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "0.2s" }}>
              <h1 className="hero-heading text-[clamp(3.2rem,8vw,7.5rem)] text-white leading-[0.94] tracking-[-0.04em]">
                SMART
                <br />
                <span className="gold-text">TECH.</span>
                <br />
                BETTER
                <br />
                <span className="text-white/20">EVERYDAY.</span>
              </h1>
            </div>
          </div>

          <p className={`text-white/50 text-base sm:text-lg max-w-sm leading-relaxed mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.4s" }}>
            Premium gadgets designed to simplify, power and upgrade everyday life. MIZAZY — where technology meets intention.
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-3 mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.55s" }}>
            <button className="btn-primary text-sm" onClick={onShop}>
              Shop MIZAZY
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="btn-outline text-sm" onClick={onShop}>
              Explore Collection
            </button>
          </div>

          {/* Stats — animated in */}
          <div className={`flex gap-8 sm:gap-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.7s" }}>
            {[
              { value: "12.2K+", label: "Happy Customers" },
              { value: "4.8★", label: "Avg Rating" },
              { value: "200+", label: "Cities" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="font-display font-800 text-white text-2xl sm:text-3xl leading-none">{s.value}</span>
                <span className="text-white/35 text-xs mt-1.5 font-display font-500 tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Floating product showcase */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center"
          style={{ height: "clamp(340px, 55vw, 620px)" }}>

          {/* Orbit rings */}
          <div className="absolute w-[350px] h-[350px] rounded-full border border-white/[0.035] animate-spin-slow pointer-events-none" />
          <div className="absolute w-[260px] h-[260px] rounded-full border border-[#D4A520]/08 animate-spin-slow pointer-events-none"
            style={{ animationDirection: "reverse", animationDuration: "22s" }} />

          {/* Ambient glow behind products */}
          <div className="absolute w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,165,32,0.14) 0%, transparent 70%)" }} />

          {/* MAIN product — centre foreground */}
          <div className="absolute z-20 animate-float" style={{ width: "clamp(180px,25vw,260px)" }}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(212,165,32,0.18) 0%, transparent 70%)" }} />
              <img
                src={MIZAZY_HERO_BUDS_URL}
                alt="Mizazy Wireless Buds 104"
                className="w-full rounded-2xl"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 80px rgba(212,165,32,0.18)", filter: "brightness(1.08) contrast(1.05)" }}
              />
              {/* Price tag */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass px-3.5 py-2 rounded-xl whitespace-nowrap">
                <p className="font-display font-700 text-white text-xs">Wireless Buds 104 · ₹1,499</p>
                <p className="text-[#D4A520] text-[9px] font-600 text-center mt-0.5">★ 4.8 · Best Seller</p>
              </div>
            </div>
          </div>

          {/* Product 2 — top right */}
          <div className="absolute right-2 sm:right-0 top-6 z-10 animate-float-d1"
            style={{ width: "clamp(110px,14vw,155px)" }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl blur-xl opacity-70"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
              <img
                src={optimizeImage("https://res.cloudinary.com/aiwtovua/image/upload/v1790765806/Mizazy_Equalizer_Bluetooth_Neckband_Orange.png", 400)}
                alt="Mizazy Equalizer Bluetooth Neckband Orange"
                className="w-full rounded-xl"
                style={{ boxShadow: "0 18px 52px rgba(0,0,0,0.75), 0 0 40px rgba(212,165,32,0.15)", filter: "brightness(1.08) contrast(1.06)" }}
              />
            </div>
          </div>

          {/* Product 3 — bottom left */}
          <div className="absolute left-0 sm:left-4 bottom-20 z-0 animate-float-d2"
            style={{ width: "clamp(90px,12vw,130px)" }}>
            <img
              src={MIZAZY_GREEN_BUDS_URL}
              alt="Mizazy Wireless Buds 104"
              className="w-full rounded-xl"
              style={{ boxShadow: "0 14px 40px rgba(0,0,0,0.7), 0 0 30px rgba(212,165,32,0.12)", filter: "brightness(1.1) contrast(1.05)", opacity: 0.92 }}
            />
          </div>

          {/* Product 4 — top left, small */}
          <div className="absolute left-8 top-8 z-0 animate-float-d3"
            style={{ width: "clamp(70px,9vw,100px)" }}>
            <img
              src={optimizeImage("https://res.cloudinary.com/aiwtovua/image/upload/v1790766592/Mizazy_135W_Super_Fast_Charger_Front.png", 300)}
              alt="Mizazy 135W Super Fast Charger"
              className="w-full rounded-xl"
              style={{ filter: "brightness(1.05) contrast(1.08)", opacity: 0.75, boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
            />
          </div>

          {/* Floating label top */}
          <div className="absolute top-4 sm:top-8 right-4 z-30 animate-float-alt"
            style={{ animationDelay: "4s" }}>
            <div className="glass px-2.5 py-1.5 rounded-lg">
              <p className="font-display font-700 text-[#5DD87A] text-[10px]">● In Stock · Ships Today</p>
            </div>
          </div>

          {/* Floating label bottom */}
          <div className="absolute bottom-24 right-0 z-30 animate-float-alt"
            style={{ animationDelay: "2s" }}>
            <div className="glass px-2.5 py-1.5 rounded-lg">
              <p className="font-display font-700 text-[#D4A520] text-[10px]">Free Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust marquee strip */}
      <div className="relative border-t border-white/05 bg-[#080808] py-3.5">
        <div className="marquee-container">
          <div className="marquee-inner">
            {[...trustItems, ...trustItems].map((item, i) => (
              <span key={i} className="flex items-center gap-3 px-6 text-white/35 text-xs font-display font-500 tracking-wide whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-[#D4A520] flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORY SECTION
═══════════════════════════════════════════════════════════ */
function CategoryMedia({ src, alt }: { src: string; alt: string }) {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
    return (
      <LazyVideo
        src={src}
        aria-label={alt}
        className="w-full h-full object-cover"
      />
    );
  }
  return <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />;
}

function CategorySection({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { categories } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section className="py-24 surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-14 reveal ${visible ? "visible" : ""}`}>
          <p className="section-label mb-3">Find Your Tech</p>
          <h2 className="section-heading text-4xl sm:text-5xl text-white">Shop by Category</h2>
          <p className="text-white/35 text-base mt-3">4 collections. One obsession.</p>
        </div>

        <div className={`reveal ${visible ? "visible reveal-delay-2" : ""}`}>
          <div className="hidden lg:grid grid-cols-4 gap-3" style={{ gridTemplateRows: "440px" }}>
            {categories.slice(0, 4).map((cat) => {
              return (
                <div
                  key={cat.name}
                  className="category-card"
                  onClick={() => onNavigate("home")}
                >
                  <div className="cat-overlay absolute inset-0 z-10"
                    style={{ background: "linear-gradient(to top, rgba(5,5,5,0.93) 0%, rgba(5,5,5,0.3) 50%, transparent 100%)" }} />
                  <CategoryMedia src={cat.image} alt={cat.name} />
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                    <div className="cat-label">
                      <h3 className="font-display font-800 text-white text-xl mb-1">{cat.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs font-display">{cat.count} Products</span>
                        <span className="cat-arrow text-[#D4A520]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile / tablet: 2-column grid */}
          <div className="grid lg:hidden grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                style={{ aspectRatio: "4/5" }}
                onClick={() => onNavigate("home")}
              >
                <div className="cat-overlay absolute inset-0 z-10"
                  style={{ background: "linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.1) 55%, transparent 100%)" }} />
                <CategoryMedia src={cat.image} alt={cat.name} />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="cat-label">
                    <h3 className="font-display font-700 text-white text-sm mb-0.5">{cat.name}</h3>
                    <span className="text-white/35 text-[10px]">{cat.count} Products</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BEST SELLERS
═══════════════════════════════════════════════════════════ */
const MOST_WANTED_IDS = ["buds-pro", "gan-65w", "neckpro", "powerslim-20k"];

function BestSellers({ onViewProduct, onAddToCart }: Pick<HomePageProps, "onViewProduct" | "onAddToCart">) {
  const { products } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const bestsellers = MOST_WANTED_IDS
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = 288 + 16;
    el.scrollBy({ left: dir === "left" ? -cardW : cardW, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = 288 + 16;
      setActiveIdx(Math.round(el.scrollLeft / cardW));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="best-sellers" className="py-24 surface-1" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-end justify-between mb-12 reveal ${visible ? "visible" : ""}`}>
          <div>
            <p className="section-label mb-3">Customer Favorites</p>
            <h2 className="section-heading text-4xl sm:text-5xl text-white">Most Wanted</h2>
            <p className="text-white/40 text-base mt-3 max-w-md">The gadgets customers keep coming back for.</p>
          </div>
          <div className="flex items-center gap-3 mobile-hidden">
            {/* Dot indicators */}
            <div className="flex gap-1.5 mr-2">
              {bestsellers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { scrollRef.current?.scrollTo({ left: i * 304, behavior: "smooth" }); }}
                  className="transition-all duration-300"
                  style={{ width: activeIdx === i ? 20 : 6, height: 6, borderRadius: 3, background: activeIdx === i ? "#D4A520" : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
            <button onClick={() => scroll("left")}
              className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/05 transition-all">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <button onClick={() => scroll("right")}
              className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:border-white/25 hover:bg-white/05 transition-all">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto no-scrollbar pb-4 drag-scroll reveal ${visible ? "visible reveal-delay-2" : ""}`}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {bestsellers.map((p) => (
            <div key={p.id} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: "start" }}>
              <ProductCard product={p} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   NEW ARRIVALS
═══════════════════════════════════════════════════════════ */
function NewArrivals({ onViewProduct }: Pick<HomePageProps, "onViewProduct" | "onAddToCart">) {
  const { products } = useStore();
  const newProducts = products.filter((p) => p.isNew || p.badge === "NEW");
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section id="new-arrivals" className="py-24 surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-14 reveal ${visible ? "visible" : ""}`}>
          <p className="section-label mb-3">Fresh From MIZAZY</p>
          <h2 className="section-heading text-4xl sm:text-5xl text-white">Just Landed</h2>
          <p className="text-white/35 text-base mt-3">Latest launches — engineered for today.</p>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 reveal ${visible ? "visible reveal-delay-2" : ""}`}>
          {/* Large feature — takes 3 cols */}
          {newProducts[0] && (
            <div
              className="lg:col-span-3 group relative rounded-2xl overflow-hidden border border-white/055 bg-[#0c0c0c] cursor-pointer hover:border-white/12 transition-all duration-400"
              style={{ minHeight: 420 }}
              onClick={() => onViewProduct(newProducts[0])}
            >
              {newProducts[0].video ? (
                <LazyVideo
                  src={newProducts[0].video}
                  poster={newProducts[0].image}
                  aria-label={newProducts[0].imageAlt || newProducts[0].name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-600"
                />
              ) : (
                <img
                  src={newProducts[0].image}
                  alt={newProducts[0].imageAlt || newProducts[0].name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-600"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]/20" />

              {/* Glow */}
              <div className="absolute top-1/2 right-8 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(212,165,32,0.12) 0%, transparent 70%)" }} />

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="badge badge-new mb-4 inline-block">Just Launched</span>
                <h3 className="font-display font-800 text-3xl text-white mb-2 group-hover:text-white transition-colors">
                  {newProducts[0].name}
                </h3>
                <p className="text-white/55 mb-6 max-w-xs leading-relaxed">{newProducts[0].tagline}</p>
                <div className="flex items-center gap-5">
                  <div>
                    <span className="font-display font-800 text-white text-2xl">₹{newProducts[0].price.toLocaleString()}</span>
                    <span className="text-white/30 text-sm line-through ml-2">₹{newProducts[0].mrp.toLocaleString()}</span>
                  </div>
                  <button
                    className="btn-primary py-2.5 px-5 text-xs"
                    onClick={(e) => { e.stopPropagation(); onViewProduct(newProducts[0]); }}
                  >
                    Explore
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right: 2 smaller — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {newProducts.slice(1, 3).map((p) => (
              <div
                key={p.id}
                className="group relative rounded-xl overflow-hidden border border-white/055 bg-[#0c0c0c] cursor-pointer hover:border-white/12 transition-all duration-350 flex-1 flex"
                style={{ minHeight: 195 }}
                onClick={() => onViewProduct(p)}
              >
                <div className="w-36 flex-shrink-0 relative overflow-hidden bg-[#0d0d0d]">
                  {p.video ? (
                    <LazyVideo
                      src={p.video}
                      poster={p.image}
                      aria-label={p.imageAlt || p.name}
                      className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-500"
                      style={{ transformOrigin: "center" }}
                    />
                  ) : (
                    <img
                      src={p.image}
                      alt={p.imageAlt || p.name}
                      className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-500"
                      style={{ transformOrigin: "center" }}
                    />
                  )}
                </div>
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <span className="badge badge-new mb-2.5 inline-block">New</span>
                  <h3 className="font-display font-700 text-lg text-white mb-1.5 leading-tight">{p.name}</h3>
                  <p className="text-white/40 text-sm mb-4 leading-snug">{p.tagline}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-700 text-white text-lg">₹{p.price.toLocaleString()}</span>
                    <span className="text-white/25 text-sm line-through">₹{p.mrp.toLocaleString()}</span>
                    <span className="text-[#D4A520] text-xs font-600">
                      {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED PRODUCT
═══════════════════════════════════════════════════════════ */
function FeaturedProduct({ onViewProduct, onAddToCart }: Pick<HomePageProps, "onViewProduct" | "onAddToCart">) {
  const { products } = useStore();
  const featured = products.find((p) => p.id === "soundmax-pro") || products[2];
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);
  if (!featured) return null;
  const discount = Math.round(((featured.mrp - featured.price) / featured.mrp) * 100);

  return (
    <section className="py-24 surface-3 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`reveal ${visible ? "visible" : ""}`}>
          <div className="relative rounded-2xl overflow-hidden border border-white/065 bg-[#0c0c0c]">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
              style={{ background: "radial-gradient(circle at 80% 20%, rgba(212,165,32,0.07) 0%, transparent 65%)" }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
              style={{ background: "radial-gradient(circle at 20% 80%, rgba(200,200,255,0.03) 0%, transparent 65%)" }} />

            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              {/* Image side */}
              <div className="relative h-72 lg:h-[520px] overflow-hidden bg-[#0d0d0d]">
                {featured.video ? (
                  <LazyVideo
                    src={featured.video}
                    poster={featured.image}
                    aria-label={featured.imageAlt || featured.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={featured.image}
                    alt={featured.imageAlt || featured.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent lg:to-[#0c0c0c] to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] to-transparent lg:hidden" />
              </div>

              {/* Content side */}
              <div className="p-8 lg:p-14 relative">
                <p className="section-label mb-5">Editor's Pick</p>
                <h2 className="section-heading text-3xl sm:text-4xl text-white mb-3">{featured.name}</h2>
                <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm">{featured.description}</p>

                <ul className="space-y-2.5 mb-8">
                  {featured.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-white/55 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(212,165,32,0.15)" }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#D4A520">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end gap-4 mb-7">
                  <span className="font-display font-800 text-4xl text-white">₹{featured.price.toLocaleString()}</span>
                  <div className="mb-1">
                    <span className="text-white/25 line-through text-sm block">₹{featured.mrp.toLocaleString()}</span>
                    <span className="text-[#D4A520] font-600 text-sm">{discount}% off</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn-primary" onClick={() => onViewProduct(featured)}>View Details</button>
                  <button className="btn-outline" onClick={() => onAddToCart({ product: featured, quantity: 1, color: featured.colors[0], colorName: featured.colorNames[0] })}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALL PRODUCTS
═══════════════════════════════════════════════════════════ */
function AllProducts({ onViewProduct, onAddToCart }: Pick<HomePageProps, "onViewProduct" | "onAddToCart">) {
  const { products } = useStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Audio", "Chargers", "Cables"];
  const filtered = activeFilter === "All"
    ? products
    : products.filter((p) => p.category.split(" / ").includes(activeFilter));
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section className="py-24 surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12 reveal ${visible ? "visible" : ""}`}>
          <div>
            <p className="section-label mb-3">The Full Collection</p>
            <h2 className="section-heading text-4xl sm:text-5xl text-white">All Products</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-display font-500 transition-all duration-250 ${
                  activeFilter === f
                    ? "bg-white text-[#050505] shadow-lg shadow-white/10"
                    : "border border-white/10 text-white/50 hover:border-white/22 hover:text-white hover:bg-white/03"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 reveal ${visible ? "visible reveal-delay-2" : ""}`}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUNDLES & OFFERS
═══════════════════════════════════════════════════════════ */
function OffersSection({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { bundles } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section id="offers" className="py-24 surface-1" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-14 reveal ${visible ? "visible" : ""}`}>
          <p className="section-label mb-3">Save More Together</p>
          <h2 className="section-heading text-4xl sm:text-5xl text-white">Bundles & Offers</h2>
          <p className="text-white/35 text-base mt-3">Curated combinations. Better together.</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 reveal ${visible ? "visible reveal-delay-2" : ""}`}>
          {bundles.map((b) => (
            <div key={b.title}
              className="relative rounded-xl overflow-hidden border border-white/065 group cursor-pointer transition-all duration-380"
              style={{ background: "#0c0c0c" }}
              onClick={() => onNavigate("home")}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(212,165,32,0.3)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(0,0,0,0.5)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.065)"; (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
            >
              <div className="h-44 overflow-hidden relative">
                <img src={b.image} alt={b.title} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c0c0c]" />
              </div>
              <div className="p-5">
                <span className="absolute top-[164px] right-4 bg-[#D4A520] text-[#050505] text-[10px] font-display font-700 px-3 py-1 rounded-full tracking-wide shadow-lg">
                  {b.tag}
                </span>
                <h3 className="font-display font-700 text-white text-lg mb-1">{b.title}</h3>
                <p className="text-white/40 text-sm mb-5">{b.subtitle}</p>
                <div className="flex items-center justify-between">
                  <div className="gold-gradient-bg text-[#050505] font-display font-800 text-lg px-3 py-1.5 rounded-lg">
                    {b.discount}% OFF
                  </div>
                  <button className="text-white/45 hover:text-white text-xs font-display font-600 tracking-wide flex items-center gap-1.5 transition-colors">
                    Shop Bundle
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Big promo banner */}
        <div className={`reveal ${visible ? "visible reveal-delay-3" : ""}`}>
          <div className="relative rounded-xl overflow-hidden border border-[#D4A520]/18 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: "linear-gradient(120deg, rgba(212,165,32,0.07) 0%, rgba(212,165,32,0.03) 50%, transparent 100%)" }}>
            {/* Glow */}
            <div className="absolute left-0 top-0 w-48 h-48 pointer-events-none"
              style={{ background: "radial-gradient(circle at 0% 0%, rgba(212,165,32,0.15) 0%, transparent 70%)" }} />
            <div className="relative">
              <p className="section-label mb-2">Limited Time Offer</p>
              <h3 className="font-display font-800 text-2xl sm:text-3xl text-white mb-1.5">Power Up Your Setup</h3>
              <p className="text-white/45 max-w-sm">Up to 40% off selected products this week only. No code needed.</p>
            </div>
            <button className="btn-gold flex-shrink-0 text-sm" onClick={() => onNavigate("home")}>
              View All Offers
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WHY MIZAZY
═══════════════════════════════════════════════════════════ */
function WhySection() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section className="py-24 surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-16 reveal ${visible ? "visible" : ""}`}>
          <p className="section-label mb-3">Our Promise</p>
          <h2 className="section-heading text-4xl sm:text-5xl text-white">Why MIZAZY?</h2>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 reveal ${visible ? "visible reveal-delay-2" : ""}`}>
          {whyMizazy.map((item, i) => (
            <div key={i}
              className="group p-6 rounded-xl border border-white/055 transition-all duration-350 cursor-default"
              style={{ background: "#0c0c0c" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(212,165,32,0.2)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 50px rgba(0,0,0,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.055)"; (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-[#D4A520] transition-all duration-300 group-hover:scale-110"
                style={{ background: "rgba(212,165,32,0.1)" }}>
                <WhyIcon icon={item.icon} />
              </div>
              <h3 className="font-display font-700 text-white text-sm mb-2.5 leading-snug">{item.title}</h3>
              <p className="text-white/38 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust badge strip */}
        <div className={`mt-10 grid grid-cols-3 sm:grid-cols-6 gap-3 reveal ${visible ? "visible reveal-delay-3" : ""}`}>
          {[
            { label: "BIS Certified", sub: "All Products" },
            { label: "1 Year Warranty", sub: "Standard Cover" },
            { label: "7-Day Returns", sub: "No Questions Asked" },
            { label: "Secure Payment", sub: "SSL Encrypted" },
            { label: "Fast Delivery", sub: "200+ Cities" },
            { label: "Genuine Products", sub: "100% Authentic" },
          ].map((b) => (
            <div key={b.label} className="text-center p-3.5 rounded-lg border border-white/045">
              <p className="font-display font-600 text-white/75 text-xs">{b.label}</p>
              <p className="text-white/25 text-[10px] mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVIEWS — with star breakdown
═══════════════════════════════════════════════════════════ */
function ReviewsSection() {
  const { reviews } = useStore();
  const [expanded, setExpanded] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  const starBreakdown = [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 19 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  return (
    <section className="py-24 surface-1" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex flex-col lg:flex-row gap-12 lg:gap-16 mb-14 reveal ${visible ? "visible" : ""}`}>
          {/* Left: rating overview */}
          <div className="flex-shrink-0 lg:w-64">
            <p className="section-label mb-3">Real Customers</p>
            <h2 className="section-heading text-4xl text-white mb-6">What They Say</h2>

            {/* Big rating */}
            <div className="flex items-end gap-3 mb-4">
              <span className="font-display font-900 text-6xl text-white leading-none">4.8</span>
              <div className="mb-1">
                <span className="stars flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                      fill={i <= 5 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </span>
                <p className="text-white/35 text-xs">15,000+ reviews</p>
              </div>
            </div>

            {/* Star breakdown bars */}
            <div className="space-y-2">
              {starBreakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2.5">
                  <span className="text-white/40 text-xs font-display font-500 w-3 flex-shrink-0 text-right">{row.stars}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#D4A520" className="flex-shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="star-bar flex-1">
                    <div
                      className="star-bar-fill"
                      style={{ width: visible ? `${row.pct}%` : "0%" }}
                    />
                  </div>
                  <span className="text-white/30 text-xs font-display w-6 flex-shrink-0">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: review cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <div key={i} className={`review-card p-5 reveal ${visible ? `visible reveal-delay-${Math.min(i + 1, 4)}` : ""}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-display font-700 text-[#D4A520] text-sm"
                      style={{ background: "linear-gradient(135deg, rgba(212,165,32,0.2), rgba(212,165,32,0.08))" }}>
                      {r.avatar}
                    </div>
                    <div>
                      <p className="font-display font-600 text-white text-sm leading-none">{r.name}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{r.location}</p>
                    </div>
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[#5DD87A] text-[9px] font-display font-600 flex-shrink-0">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Verified
                    </span>
                  )}
                </div>

                <Stars rating={r.rating} size={11} />

                <p className={`text-white/55 text-xs mt-3 leading-relaxed ${expanded === i ? "" : "line-clamp-3"}`}>
                  "{r.review}"
                </p>
                {r.review.length > 100 && (
                  <button onClick={() => setExpanded(expanded === i ? null : i)}
                    className="text-[#D4A520] text-[10px] mt-1.5 font-600 hover:underline">
                    {expanded === i ? "Show less" : "Read more"}
                  </button>
                )}

                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/05">
                  <p className="text-white/25 text-[10px] truncate">{r.product}</p>
                  <p className="text-white/20 text-[10px] flex-shrink-0 ml-2">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   NEWSLETTER
═══════════════════════════════════════════════════════════ */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useReveal(ref);

  return (
    <section className="py-24 surface-2" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative rounded-2xl overflow-hidden border border-white/065 p-10 sm:p-16 text-center reveal ${visible ? "visible" : ""}`}
          style={{ background: "#0c0c0c" }}>
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,165,32,0.08) 0%, transparent 70%)" }} />

          <p className="section-label mb-4">Stay Connected</p>
          <h2 className="section-heading text-3xl sm:text-5xl text-white mb-4">Join the MIZAZY Community</h2>
          <p className="text-white/40 text-base max-w-md mx-auto mb-10 leading-relaxed">
            Early access to launches, exclusive member deals, and gadget insights — to your inbox.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-[#5DD87A]/30"
              style={{ background: "rgba(93,216,122,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5DD87A">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span className="font-display font-600 text-[#5DD87A]">You're in! Welcome to MIZAZY.</span>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.includes("@")) return;
                try {
                  await api.newsletter(email);
                  setSubmitted(true);
                } catch {
                  setSubmitted(true);
                }
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="input-dark flex-1 py-3.5"
                required
              />
              <button type="submit" className="btn-gold flex-shrink-0 py-3.5">Subscribe</button>
            </form>
          )}

          <p className="text-white/20 text-xs mt-4">No spam. Unsubscribe anytime.</p>

          {/* Social */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-white/05">
            {["Instagram", "Twitter / X", "YouTube", "LinkedIn"].map((s) => (
              <button key={s} className="text-white/25 hover:text-white/60 text-xs font-display font-500 transition-colors">{s}</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { user } = useStore();
  const accountLinks = ["My Account", "My Orders", ...(user ? ["Track Order"] : []), "Wishlist", "Reviews"];
  return (
    <footer className="bg-[#080808] border-t border-white/055 pt-16 pb-32 md:pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <img
                src={MIZAZY_LOGO_URL}
                alt="MIZAZY"
                style={{
                  height: 72,
                  objectFit: "contain",
                  filter: "invert(1) hue-rotate(180deg) drop-shadow(0 0 14px rgba(212,165,32,0.45))",
                }}
              />
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-6 max-w-[200px]">
              Premium technology made simple. Designed for everyday life.
            </p>
            <div className="flex gap-2.5">
              {["IG", "X", "YT", "LI"].map((s) => (
                <button key={s}
                  className="w-8 h-8 rounded-lg border border-white/09 flex items-center justify-center text-white/30 hover:text-white hover:border-white/22 transition-all text-[10px] font-display font-700">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {[
            { title: "Shop", links: ["All Products", "New Arrivals", "Best Sellers", "Offers", "Bundles"] },
            { title: "Help", links: ["Contact Us", "Shipping Info", "Returns", "Warranty", "FAQs"] },
            { title: "Account", links: accountLinks },
            { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Refund Policy", "Shipping Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-700 text-white text-sm mb-5 tracking-wider">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <button
                      onClick={() =>
                        l === "Track Order" ? onNavigate("track") : l === "My Account" || l === "My Orders" || l === "Wishlist" ? onNavigate("account") : onNavigate("home")
                      }
                      className="text-white/30 hover:text-white/65 text-sm transition-colors text-left font-body"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/20 text-xs">
          <p className="font-body">© 2026 MIZAZY Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {["UPI", "Visa", "Mastercard", "Rupay", "PayTM", "EMI"].map((p) => (
              <span key={p} className="px-2 py-1 border border-white/07 rounded text-[9px] font-display font-600 text-white/25">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export default function HomePage({ onViewProduct, onAddToCart, onNavigate }: HomePageProps) {
  return (
    <div>
      <Hero onShop={() => {
        const el = document.getElementById("all-products");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }} />
      <CategorySection onNavigate={onNavigate} />
      <BestSellers onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
      <NewArrivals onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
      <FeaturedProduct onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
      <div id="all-products">
        <AllProducts onViewProduct={onViewProduct} onAddToCart={onAddToCart} />
      </div>
      <OffersSection onNavigate={onNavigate} />
      <WhySection />
      <ReviewsSection />
      <Newsletter />
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
