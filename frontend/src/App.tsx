import { useState, useEffect, useCallback } from "react";
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

type Page = "home" | "product" | "checkout" | "track" | "confirmation" | "account";

interface Toast {
  id: number;
  message: string;
  sub?: string;
  type?: "success" | "info";
}

function productFromPath(products: Product[]): Product | null {
  const match = window.location.pathname.match(/^\/product\/([^/]+)\/?$/);
  if (!match) return null;
  const key = decodeURIComponent(match[1]);
  return products.find((p) => p.slug === key || p.id === key) ?? null;
}

export default function App() {
  const { cart, setCart, user, products } = useStore();
  const [initialProduct] = useState(() => productFromPath(products));
  const [page, setPage] = useState<Page>(initialProduct ? "product" : "home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct);

  useEffect(() => {
    const path = page === "product" && selectedProduct
      ? `/product/${selectedProduct.slug || selectedProduct.id}`
      : "/";
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", path);
    }
  }, [page, selectedProduct]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [trackPrefill, setTrackPrefill] = useState<string | undefined>(undefined);

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
