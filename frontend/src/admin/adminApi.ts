const ADMIN_TOKEN_KEY = "mizazy_admin_token";

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export class AdminAuthError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> | undefined) };
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/admin/login") throw new AdminAuthError(data.message || "Please sign in again");
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data as T;
}

export type Doc = Record<string, unknown> & { _id: string };

export interface ListResult {
  items: Doc[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  counts: Record<"products" | "orders" | "users" | "subscribers" | "coupons" | "reviews" | "ordersToday" | "activeCarts", number>;
  revenue: number;
  lowStock: { _id: string; id: string; name: string; stock: number }[];
  recentOrders: Doc[];
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: { email: string; name: string } }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ email: string; name: string }>("/admin/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string; token: string }>("/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  stats: () => request<AdminStats>("/admin/stats"),
  list: (collection: string, params: { q?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    return request<ListResult>(`/admin/${collection}?${qs.toString()}`);
  },
  create: (collection: string, body: Record<string, unknown>) =>
    request<Doc>(`/admin/${collection}`, { method: "POST", body: JSON.stringify(body) }),
  update: (collection: string, id: string, body: Record<string, unknown>) =>
    request<Doc>(`/admin/${collection}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  sendPaymentEmail: (orderId: string) =>
    request<{ message: string }>(`/admin/orders/${orderId}/payment-email`, { method: "POST" }),
  createDelhiveryShipment: (orderId: string) =>
    request<{ message: string; order: Doc }>(`/admin/orders/${orderId}/delhivery/create`, { method: "POST" }),
  refreshDelhiveryTracking: (orderId: string) =>
    request<{ message: string; order: Doc }>(`/admin/orders/${orderId}/delhivery/refresh`, { method: "POST" }),
  remove: (collection: string, id: string) =>
    request<{ ok: boolean }>(`/admin/${collection}/${id}`, { method: "DELETE" }),
  uploadImages: async (files: FileList | File[], folder = "products") => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("images", f));
    form.append("folder", folder);
    const data = await request<{ images: { url: string }[] }>("/upload/images", { method: "POST", body: form });
    return data.images.map((i) => i.url);
  },
};
