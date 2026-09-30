import { useState, useEffect } from "react";
import { CartItem } from "../data";
import { MIZAZY_NAV_LOGO_URL } from "../brand";

interface NavProps {
  onNavigate: (page: string) => void;
  cartItems: CartItem[];
  onCartOpen: () => void;
  onSearchOpen: () => void;
  onAccount: () => void;
  onWishlist: () => void;
  currentPage: string;
}

export default function Nav({ onNavigate, cartItems, onCartOpen, onSearchOpen, onAccount, onWishlist, currentPage }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount === 0) return;
    setCartBounce(true);
    const t = setTimeout(() => setCartBounce(false), 600);
    return () => clearTimeout(t);
  }, [cartCount]);

  const scrollToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (currentPage !== "home") {
      onNavigate("home");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navLinks = [
    { label: "Shop", action: () => scrollToSection("all-products") },
    { label: "New Arrivals", action: () => scrollToSection("new-arrivals") },
    { label: "Best Sellers", action: () => scrollToSection("best-sellers") },
    { label: "Offers", action: () => scrollToSection("offers") },
  ];

  return (
    <>
      {/* Promo strip */}
      <div className="promo-strip py-2 text-center font-display font-600 text-[#050505] text-[11px] tracking-widest uppercase select-none">
        Free delivery on orders above ₹999 &nbsp;·&nbsp; Use MIZAZY10 for 10% off
      </div>

      <nav className={`sticky top-0 z-40 transition-all duration-400 ${scrolled ? "glass-dark" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between h-[80px] gap-4">

          {/* Logo */}
          <button
            onClick={() => { onNavigate("home"); setMobileOpen(false); }}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <img
              src={MIZAZY_NAV_LOGO_URL}
              alt="MIZAZY"
              className="transition-all duration-200 group-hover:scale-105"
              style={{
                height: 72,
                width: "auto",
                maxWidth: 220,
                objectFit: "contain",
              }}
            />
          </button>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => l.action()}
                className="nav-link"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/055 transition-all duration-200"
              aria-label="Search (⌘K)"
              title="Search (⌘K)"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Account (desktop) */}
            <button onClick={onAccount} className="w-9 h-9 hidden md:flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/055 transition-all duration-200" aria-label="Account">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            {/* Wishlist (desktop) */}
            <button onClick={onWishlist} className="w-9 h-9 hidden md:flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/055 transition-all duration-200" aria-label="Wishlist">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Track (desktop) */}
            <button
              onClick={() => onNavigate("track")}
              className="hidden md:block text-[10px] font-display font-600 text-white/40 hover:text-white/80 transition-colors tracking-[0.18em] uppercase px-3 py-2"
            >
              Track
            </button>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/055 transition-all duration-200"
              aria-label="Cart"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[#D4A520] text-[#050505] text-[9px] font-display font-800 rounded-full flex items-center justify-center"
                  style={{ transform: cartBounce ? "scale(1.35)" : "scale(1)", transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/55 hover:text-white hover:bg-white/055 transition-all"
            >
              <div className="w-[18px] flex flex-col gap-[5px]">
                <div className={`h-[1.5px] bg-current rounded transition-all duration-250 ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
                <div className={`h-[1.5px] bg-current rounded transition-all duration-250 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
                <div className={`h-[1.5px] bg-current rounded transition-all duration-250 ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass-dark border-t border-white/055 px-4 py-5 space-y-0.5 animate-scale-in">
            {navLinks.map((l) => (
              <button key={l.label}
                onClick={() => l.action()}
                className="w-full text-left px-4 py-3 rounded-xl font-display font-500 text-white/70 hover:text-white hover:bg-white/04 transition-all text-base">
                {l.label}
              </button>
            ))}
            <div className="h-px bg-white/055 my-2 mx-4" />
            <button
              onClick={() => { onAccount(); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-display font-500 text-white/40 hover:text-white/70 hover:bg-white/04 transition-all text-base"
            >
              My Account
            </button>
            <button
              onClick={() => { onNavigate("track"); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-display font-500 text-white/40 hover:text-white/70 hover:bg-white/04 transition-all text-base"
            >
              Track My Order
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="mobile-bottom-nav flex items-center justify-around px-2 py-2.5">
        {[
          { icon: "home", label: "Home", action: () => onNavigate("home") },
          { icon: "shop", label: "Shop", action: () => scrollToSection("all-products") },
          { icon: "search", label: "Search", action: onSearchOpen },
          { icon: "heart", label: "Wishlist", action: onWishlist },
          { icon: "cart", label: "Cart", action: onCartOpen },
        ].map((item) => (
          <button key={item.label} onClick={item.action}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90">
            <div className="relative w-5 h-5 flex items-center justify-center text-white/45">
              {item.icon === "home" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
              {item.icon === "shop" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
              {item.icon === "search" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
              {item.icon === "heart" && <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
              {item.icon === "cart" && (
                <>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D4A520] text-[#050505] text-[8px] font-800 rounded-full flex items-center justify-center font-display">
                      {cartCount}
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-[9px] font-display font-500 text-white/35 tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
