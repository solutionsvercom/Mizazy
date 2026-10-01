import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Product, CartItem, Review, products as fallbackProducts, categories as fallbackCategories, reviews as fallbackReviews, bundles as fallbackBundles } from "./data";
import { api, AuthUser, getToken, setToken } from "./api";
import { optimizeImageField, optimizeProductMedia } from "./media";

interface Bundle {
  title: string;
  subtitle: string;
  products: string[];
  discount: number;
  image: string;
  tag: string;
}

interface Category {
  name: string;
  image: string;
  count: number;
}

interface StoreValue {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  bundles: Bundle[];
  loading: boolean;
  user: AuthUser | null;
  wishlist: string[];
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  startSession: (token: string, user: AuthUser) => void;
  toggleWishlist: (productId: string) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "mizazy_cart";
const WISH_KEY = "mizazy_wishlist";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadLocalWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const optimizeProducts = (list: Product[]) => list.map(optimizeProductMedia);
const optimizeCategories = (list: Category[]) => list.map((c) => optimizeImageField(c, 800));
const optimizeBundles = (list: Bundle[]) => list.map((b) => optimizeImageField(b, 800));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => optimizeProducts(fallbackProducts));
  const [categories, setCategories] = useState<Category[]>(() => optimizeCategories(fallbackCategories));
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [bundles, setBundles] = useState<Bundle[]>(() => optimizeBundles(fallbackBundles));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(loadLocalWishlist);
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const userId = user?._id;
  const [cartSynced, setCartSynced] = useState(false);
  const productsRef = useRef(products);
  productsRef.current = products;
  const cartRef = useRef(cart);
  cartRef.current = cart;

  // After sign-in, restore the account's saved cart if this browser's cart is empty
  // (e.g. the customer opened a cart reminder email on another device).
  useEffect(() => {
    setCartSynced(false);
    if (!userId) return;
    let cancelled = false;
    api
      .getCart()
      .then(({ items }) => {
        if (cancelled || cartRef.current.length || !items.length) return;
        const restored = items.flatMap((item) => {
          const product = productsRef.current.find((p) => p.id === item.productId);
          return product ? [{ product, quantity: item.quantity, color: item.color, colorName: item.colorName }] : [];
        });
        if (restored.length) setCart(restored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCartSynced(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Keep the server copy current so abandoned-cart reminders reflect what the customer left behind.
  useEffect(() => {
    if (!userId || !cartSynced) return;
    const timer = setTimeout(() => {
      api
        .saveCart(cart.map((i) => ({ productId: i.product.id, quantity: i.quantity, color: i.color, colorName: i.colorName })))
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [cart, userId, cartSynced]);

  useEffect(() => {
    if (!user) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, user]);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
      setWishlist(me.wishlist || []);
    } catch {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.catalog();
        if (cancelled) return;
        setProducts(optimizeProducts(data.products as Product[]));
        setCategories(optimizeCategories(data.categories as Category[]));
        setReviews(data.reviews as Review[]);
        setBundles(optimizeBundles(data.bundles as Bundle[]));
      } catch {
        /* keep local catalog fallback if API is offline */
      } finally {
        if (!cancelled) setLoading(false);
      }
      await refreshUser();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const startSession = useCallback((token: string, sessionUser: AuthUser) => {
    setToken(token);
    setUser(sessionUser);
    setWishlist(sessionUser.wishlist || []);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    startSession(data.token, data.user);
  }, [startSession]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const data = await api.register({ name, email, phone, password });
    setToken(data.token);
    setUser(data.user);
    setWishlist(data.user.wishlist || []);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setWishlist(loadLocalWishlist());
  }, []);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const on = wishlist.includes(productId);
      const next = on ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
      setWishlist(next);
      if (!user) return;
      try {
        const ids = on ? await api.removeWishlist(productId) : await api.addWishlist(productId);
        setWishlist(ids);
      } catch {
        setWishlist(wishlist);
      }
    },
    [user, wishlist]
  );

  const value = useMemo(
    () => ({
      products,
      categories,
      reviews,
      bundles,
      loading,
      user,
      wishlist,
      cart,
      setCart,
      refreshUser,
      login,
      register,
      logout,
      startSession,
      toggleWishlist,
    }),
    [products, categories, reviews, bundles, loading, user, wishlist, cart, refreshUser, login, register, logout, startSession, toggleWishlist]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
