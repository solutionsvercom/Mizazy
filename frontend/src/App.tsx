import { useState, useEffect, useCallback, useRef } from "react";
import { Product, CartItem } from "./data";
import { useStore } from "./store";
import { PlacedOrder } from "./api";
import Nav from "./components/Nav";
import CartSidebar from "./components/CartSidebar";
import SearchOverlay from "./components/SearchOverlay";
import AuthModal from "./components/AuthModal";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackingPage from "./pages/TrackingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AccountPage from "./pages/AccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FaqPage from "./pages/FaqPage";
import ReviewsPage from "./pages/ReviewsPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";

type Page = "home" | "product" | "checkout" | "track" | "confirmation" | "account" | "reset-password" | "faqs" | "reviews" | "payment-status";

interface Toast {
  id: number;
  message: string;
  sub?: string;
  type?: "success" | "info";
}

const SIMPLE_PAGES: Record<string, Page> = {
  "/checkout": "checkout",
  "/track": "track",
  "/account": "account",
  "/confirmation": "confirmation",
  "/reset-password": "reset-password",
  "/faqs": "faqs",
  "/reviews": "reviews",
  "/payment-status": "payment-status",
};

function productFromPath(products: Product[]): Product | null {
  const match = window.location.pathname.match(/^\/product\/([^/]+)\/?$/);
  if (!match) return null;
  const key = decodeURIComponent(match[1]);
  return products.find((p) => p.slug === key || p.id === key) ?? null;
}

function routeFromLocation(products: Product[], hasOrder: boolean): { page: Page; product: Product | null } {
  const product = productFromPath(products);
  if (product) return { page: "product", product };
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const page = SIMPLE_PAGES[path];
  if (!page || (page === "confirmation" && !hasOrder)) return { page: "home", product: null };
  return { page, product: null };
}

function pathFor(page: Page, product: Product | null): string {
  if (page === "product" && product) return `/product/${product.slug || product.id}`;
  if (page === "home" || page === "product") return "/";
  return `/${page}`;
}

export default function App() {
  const { cart, setCart, user, products } = useStore();
  const [initialRoute] = useState(() => routeFromLocation(products, false));
  const [page, setPage] = useState<Page>(initialRoute.page);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialRoute.product);
  const replaceNextEntry = useRef(true);
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    // Visitors landing on an inner page (e.g. from Google) get the home page behind it,
    // so the browser Back button returns to the MIZAZY home page instead of leaving the site.
    if (initialRoute.page !== "home" && !window.history.state?.mizazy) {
      const current = window.location.pathname + window.location.search + window.location.hash;
      window.history.replaceState({ mizazy: true }, "", "/");
      window.history.pushState({ mizazy: true }, "", current);
    }
  }, [initialRoute]);

  useEffect(() => {
    const path = pathFor(page, selectedProduct);
    const replace = replaceNextEntry.current;
    replaceNextEntry.current = false;
    if (window.location.pathname === path) return;
    if (replace) window.history.replaceState({ mizazy: true }, "", path);
    else window.history.pushState({ mizazy: true }, "", path);
  }, [page, selectedProduct]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [trackPrefill, setTrackPrefill] = useState<string | undefined>(undefined);
  const hasOrderRef = useRef(false);
  hasOrderRef.current = placedOrder !== null;

  useEffect(() => {
    const onPopState = () => {
      const next = routeFromLocation(productsRef.current, hasOrderRef.current);
      if (pathFor(next.page, next.product) !== window.location.pathname) {
        replaceNextEntry.current = true;
      }
      if (next.product) setSelectedProduct(next.product);
      setPage(next.page);
      setCartOpen(false);
      setSearchOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const addToast = useCallback((message: string, sub?: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, sub, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const navigate = useCallback((to: string, product?: Product) => {
    if (product) setSelectedProduct(product);
    setPage(to as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCartOpen(false);
  }, []);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setPage("product");
    window.scrollTo({ top: 0 });
  }, []);

  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.product.id === item.product.id && c.color === item.color
      );
      if (existing) {
        return prev.map((c) =>
          c.product.id === item.product.id && c.color === item.color
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
    addToast(`${item.product.name} added to cart`, item.colorName);
  }, [addToast, setCart]);

  const handleBuyNow = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.product.id === item.product.id && c.color === item.color
      );
      if (existing) {
        return prev.map((c) =>
          c.product.id === item.product.id && c.color === item.color
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        );
      }
      return [...prev, item];
    });
    setPage("checkout");
    window.scrollTo({ top: 0 });
  }, [setCart]);

  const handleUpdateQty = useCallback((productId: string, color: string, qty: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.product.id === productId && c.color === color ? { ...c, quantity: qty } : c
      )
    );
  }, [setCart]);

  const handleRemoveItem = useCallback((productId: string, color: string) => {
    setCart((prev) => prev.filter((c) => !(c.product.id === productId && c.color === color)));
  }, [setCart]);

  const handleOrderPlaced = useCallback((order: PlacedOrder) => {
    setPlacedOrder(order);
    setCart([]);
    replaceNextEntry.current = true;
    setPage("confirmation");
    window.scrollTo({ top: 0 });
  }, [setCart]);

  const handleTrack = useCallback(() => {
    setTrackPrefill(placedOrder?.orderNumber);
    setPage("track");
    window.scrollTo({ top: 0 });
  }, [placedOrder]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-full bg-[#050505] text-white">
      <Nav
        onNavigate={navigate}
        cartItems={cart}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
        onAccount={() => (user ? navigate("account") : setAuthOpen(true))}
        onWishlist={() => (user ? navigate("account") : setAuthOpen(true))}
        currentPage={page}
      />

      <CartSidebar
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveItem}
        onCheckout={() => {
          setCartOpen(false);
          setPage("checkout");
          window.scrollTo({ top: 0 });
        }}
        onViewProduct={handleViewProduct}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onViewProduct={(p) => {
          handleViewProduct(p);
          setSearchOpen(false);
        }}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {page === "home" && (
        <HomePage
          onViewProduct={handleViewProduct}
          onAddToCart={handleAddToCart}
          onNavigate={navigate}
        />
      )}

      {page === "product" && selectedProduct && (
        <ProductPage
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onNavigate={navigate}
          onViewProduct={handleViewProduct}
        />
      )}

      {page === "checkout" && (
        <CheckoutPage
          cart={cart}
          onOrderPlaced={handleOrderPlaced}
          onNavigate={navigate}
        />
      )}

      {page === "track" && (
        <TrackingPage
          onNavigate={navigate}
          onAuthOpen={() => setAuthOpen(true)}
          prefillOrder={trackPrefill}
        />
      )}

      {page === "confirmation" && placedOrder && (
        <ConfirmationPage
          order={placedOrder}
          onNavigate={navigate}
          onTrack={handleTrack}
        />
      )}

      {page === "faqs" && <FaqPage onNavigate={navigate} />}

      {page === "reviews" && <ReviewsPage onNavigate={navigate} />}

      {page === "payment-status" && <PaymentStatusPage onOrderPlaced={handleOrderPlaced} onNavigate={navigate} />}
      {page === "reset-password" && (
        <ResetPasswordPage onNavigate={navigate} onAuthOpen={() => setAuthOpen(true)} />
      )}

      {page === "account" && (
        <AccountPage
          onNavigate={navigate}
          onViewProduct={handleViewProduct}
          onAuthOpen={() => setAuthOpen(true)}
        />
      )}

      <div className="fixed bottom-20 md:bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast pointer-events-auto animate-slide-right"
            style={{ animationDirection: "normal" }}
          >
            <div className="w-8 h-8 rounded-full bg-[#5DD87A]/15 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#5DD87A">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-600 text-white text-sm leading-tight">{toast.message}</p>
              {toast.sub && <p className="text-white/40 text-xs mt-0.5">{toast.sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
