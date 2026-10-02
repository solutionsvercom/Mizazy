const TOKEN_KEY = "mizazy_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data as T;
}

export const api = {
  catalog: () => request<{ products: unknown[]; categories: unknown[]; reviews: unknown[]; bundles: unknown[] }>("/catalog"),
  products: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/products${qs}`);
  },
  product: (id: string) => request(`/products/${id}`),
  search: (q: string) => request(`/products/search?q=${encodeURIComponent(q)}`),
  reviews: (productId?: string) =>
    request(`/reviews${productId ? `?productId=${encodeURIComponent(productId)}` : ""}`),
  register: (body: { name: string; email: string; phone: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (body: { email: string; token: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<AuthUser>("/auth/me"),
  updateMe: (body: { name?: string; phone?: string }) =>
    request<AuthUser>("/auth/me", { method: "PUT", body: JSON.stringify(body) }),
  addAddress: (body: Address) =>
    request<AuthUser>("/auth/addresses", { method: "POST", body: JSON.stringify(body) }),
  wishlist: () => request<string[]>("/auth/wishlist"),
  addWishlist: (id: string) => request<string[]>(`/auth/wishlist/${id}`, { method: "POST" }),
  removeWishlist: (id: string) => request<string[]>(`/auth/wishlist/${id}`, { method: "DELETE" }),
  getCart: () => request<{ items: SavedCartItem[] }>("/cart"),
  saveCart: (items: SavedCartItem[]) =>
    request<{ items: SavedCartItem[] }>("/cart", { method: "PUT", body: JSON.stringify({ items }) }),
  validateCoupon: (code: string) =>
    request<{ code: string; discountPercent: number }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  placeOrder: (body: PlaceOrderBody, adminToken?: string | null) =>
    request<PlacedOrder & { cashfree?: { paymentSessionId: string; token: string } }>("/orders", {
      method: "POST",
      body: JSON.stringify(body),
      headers: adminToken ? { "X-Admin-Token": adminToken } : undefined,
    }),
  paymentConfig: () => request<{ cashfree: boolean; mode: "sandbox" | "production" }>("/payments/config"),
  verifyPayment: (orderNumber: string, token: string) =>
    request<{ paymentStatus: "pending" | "confirmed" | "failed"; order: PlacedOrder }>("/payments/cashfree/verify", {
      method: "POST",
      body: JSON.stringify({ orderNumber, token }),
    }),
  trackOrder: (orderNumber: string) =>
    request<PlacedOrder>(`/orders/track?${new URLSearchParams({ orderNumber }).toString()}`),
  myOrders: () => request<PlacedOrder[]>("/orders/mine"),
  newsletter: (email: string) =>
    request<{ ok: boolean; message: string }>("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

export interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist: string[];
}

export interface SavedCartItem {
  productId: string;
  quantity: number;
  color: string;
  colorName: string;
}

export interface PlaceOrderBody {
  items: {
    productId: string;
    quantity: number;
    color: string;
    colorName: string;
  }[];
  address: Address;
  delivery: "standard" | "express";
  payment: { method: "upi" | "card" | "cod" | "netbanking" };
  coupon?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  colorName: string;
  quantity: number;
  price: number;
  mrp: number;
}

export interface TimelineStep {
  id: string;
  label: string;
  desc: string;
  time: string;
  done: boolean;
  active: boolean;
}

export interface PlacedOrder {
  orderNumber: string;
  phone: string;
  address: Address;
  items: OrderItem[];
  delivery: "standard" | "express";
  payment: { method: string; status: string; upiId?: string; gateway?: string; cfPaymentId?: string; paymentGroup?: string };
  coupon?: string;
  totals: {
    subtotal: number;
    discount: number;
    couponDiscount: number;
    shipping: number;
    total: number;
  };
  status: string;
  currentStatusLabel: string;
  currentStatusDesc: string;
  timeline: TimelineStep[];
  trackingNumber: string;
  shippingPartner: string;
  estimatedDelivery: string;
  createdAt: string;
}
