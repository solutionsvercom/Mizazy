import type { ReactNode } from "react";
import type { Doc } from "./adminApi";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "list"
  | "json"
  | "image"
  | "images"
  | "date"
  | "readonly";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  section?: string;
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
}

export interface Column {
  label: string;
  render: (doc: Doc) => ReactNode;
}

export interface CollectionConfig {
  id: string;
  label: string;
  singular: string;
  canCreate: boolean;
  canDelete: boolean;
  columns: Column[];
  fields: Field[];
  defaults?: Record<string, unknown>;
}

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

export function setPath<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...obj, [head]: value };
  const child = (obj[head] && typeof obj[head] === "object" ? obj[head] : {}) as Record<string, unknown>;
  return { ...obj, [head]: setPath(child, rest.join("."), value) };
}

const rupees = (n: unknown) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dateTime = (v: unknown) =>
  v ? new Date(String(v)).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
const text = (v: unknown) => (v === undefined || v === null || v === "" ? "—" : String(v));
const thumb = (url: unknown) =>
  url ? <img src={String(url).replace("/image/upload/", "/image/upload/f_auto,q_auto,w_80,h_80,c_pad/")} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/5" /> : null;
const pill = (label: string, tone: "gold" | "green" | "red" | "grey" = "grey") => {
  const tones = {
    gold: "bg-[#D4A520]/15 text-[#D4A520]",
    green: "bg-[#5DD87A]/15 text-[#5DD87A]",
    red: "bg-red-500/15 text-red-400",
    grey: "bg-white/8 text-white/60",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{label}</span>;
};

export const ORDER_STATUS_OPTIONS = [
  { value: "confirmed", label: "Order Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "transit", label: "In Transit" },
  { value: "out", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const orderStatusPill = (doc: Doc) => {
  const status = String(doc.status || "");
  const tone = status === "delivered" ? "green" : status === "cancelled" ? "red" : "gold";
  return pill(String(doc.currentStatusLabel || status), tone);
};

export const COLLECTIONS: CollectionConfig[] = [
  {
    id: "orders",
    label: "Orders",
    singular: "order",
    canCreate: false,
    canDelete: true,
    columns: [
      { label: "Order", render: (d) => <span className="font-semibold text-white">{text(d.orderNumber)}</span> },
      { label: "Date", render: (d) => dateTime(d.createdAt) },
      { label: "Customer", render: (d) => <>{text(getPath(d, "address.name"))}<div className="text-white/35 text-xs">{text(d.email || getPath(d, "address.phone"))}</div></> },
      { label: "Total", render: (d) => rupees(getPath(d, "totals.total")) },
      { label: "Payment", render: (d) => `${String(getPath(d, "payment.method") || "").toUpperCase()} · ${text(getPath(d, "payment.status"))}` },
      { label: "Status", render: orderStatusPill },
    ],
    fields: [
      { key: "status", label: "Order status", type: "select", section: "Status", options: ORDER_STATUS_OPTIONS, help: "Changing this overrides the automatic tracking progress the customer sees." },
      { key: "payment.status", label: "Payment status", type: "select", section: "Status", options: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed / Paid" },
        { value: "failed", label: "Failed" },
      ], help: 'Changing this to "Confirmed / Paid" emails the customer a payment confirmation from payment@mizazy.com.' },
      { key: "trackingNumber", label: "Tracking number", type: "text", section: "Shipping" },
      { key: "shippingPartner", label: "Shipping partner", type: "text", section: "Shipping" },
      { key: "estimatedDelivery", label: "Estimated delivery", type: "date", section: "Shipping" },
      { key: "address.name", label: "Name", type: "text", section: "Delivery address" },
      { key: "address.phone", label: "Phone", type: "text", section: "Delivery address" },
      { key: "address.address", label: "Address", type: "textarea", section: "Delivery address" },
      { key: "address.city", label: "City", type: "text", section: "Delivery address" },
      { key: "address.state", label: "State", type: "text", section: "Delivery address" },
      { key: "address.pincode", label: "Pincode", type: "text", section: "Delivery address" },
      { key: "email", label: "Customer email", type: "text", section: "Customer" },
      { key: "phone", label: "Customer phone", type: "text", section: "Customer" },
      { key: "orderNumber", label: "Order number", type: "readonly", section: "Order details" },
      { key: "payment.method", label: "Payment method", type: "readonly", section: "Order details" },
      { key: "payment.gateway", label: "Payment gateway", type: "readonly", section: "Order details" },
      { key: "payment.cfPaymentId", label: "Cashfree transaction ID", type: "readonly", section: "Order details" },
      { key: "payment.paymentGroup", label: "Paid with", type: "readonly", section: "Order details" },
      { key: "payment.paidAt", label: "Paid at", type: "readonly", section: "Order details" },
      { key: "coupon", label: "Coupon used", type: "readonly", section: "Order details" },
      { key: "items", label: "Items", type: "readonly", section: "Order details" },
      { key: "totals", label: "Totals", type: "readonly", section: "Order details" },
    ],
  },
  {
    id: "products",
    label: "Products",
    singular: "product",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "", render: (d) => thumb(d.image) },
      { label: "Product", render: (d) => <><span className="font-semibold text-white">{text(d.name)}</span><div className="text-white/35 text-xs">{text(d.id)}</div></> },
      { label: "Category", render: (d) => text(d.category) },
      { label: "Price", render: (d) => <>{rupees(d.price)} <span className="text-white/30 line-through text-xs">{rupees(d.mrp)}</span></> },
      { label: "Stock", render: (d) => (Number(d.stock) < 5 ? pill(`${d.stock} left`, "red") : text(d.stock)) },
      { label: "Badge", render: (d) => (d.badge ? pill(String(d.badge), "gold") : "—") },
    ],
    defaults: { stock: 20, rating: 0, reviews: 0, images: [], colors: [], colorNames: [], features: [], inBox: [], isNew: false },
    fields: [
      { key: "name", label: "Product name", type: "text", section: "Basics", required: true },
      { key: "id", label: "Product ID", type: "text", section: "Basics", required: true, help: "Unique internal ID used by cart and orders, e.g. buds-pro. Avoid changing it once orders exist." },
      { key: "slug", label: "URL slug", type: "text", section: "Basics", help: "Used in the page address: mizazy.com/product/<slug>" },
      { key: "title", label: "Full title", type: "text", section: "Basics" },
      { key: "tagline", label: "Tagline", type: "text", section: "Basics" },
      { key: "category", label: "Category", type: "text", section: "Basics", required: true },
      { key: "badge", label: "Badge", type: "select", section: "Basics", options: [
        { value: "", label: "None" },
        { value: "BEST SELLER", label: "BEST SELLER" },
        { value: "NEW", label: "NEW" },
        { value: "LIMITED", label: "LIMITED" },
        { value: "SALE", label: "SALE" },
      ] },
      { key: "isNew", label: "Show in New Arrivals", type: "boolean", section: "Basics" },
      { key: "price", label: "Selling price (₹)", type: "number", section: "Pricing & stock", required: true },
      { key: "mrp", label: "MRP (₹)", type: "number", section: "Pricing & stock", required: true },
      { key: "stock", label: "Stock", type: "number", section: "Pricing & stock" },
      { key: "emi", label: "EMI text", type: "text", section: "Pricing & stock" },
      { key: "rating", label: "Rating", type: "number", section: "Pricing & stock" },
      { key: "reviews", label: "Review count", type: "number", section: "Pricing & stock" },
      { key: "image", label: "Main image", type: "image", section: "Media", required: true },
      { key: "images", label: "Gallery images", type: "images", section: "Media" },
      { key: "video", label: "Video URL", type: "text", section: "Media" },
      { key: "imageAlt", label: "Image alt text", type: "text", section: "Media" },
      { key: "imageTitle", label: "Image title", type: "text", section: "Media" },
      { key: "colors", label: "Colour codes", type: "list", section: "Colours", help: "One per line, e.g. #FFFFFF" },
      { key: "colorNames", label: "Colour names", type: "list", section: "Colours", help: "One per line, same order as colour codes" },
      { key: "colorImages", label: "Images per colour", type: "json", section: "Colours", help: "A list of image lists, one list per colour (same order as colours)." },
      { key: "description", label: "Description", type: "textarea", section: "Details" },
      { key: "features", label: "Features", type: "list", section: "Details", help: "One per line" },
      { key: "inBox", label: "In the box", type: "list", section: "Details", help: "One per line" },
      { key: "warranty", label: "Warranty", type: "text", section: "Details" },
      { key: "specs", label: "Specifications", type: "json", section: "Details", help: 'Example: { "Bluetooth": "5.3", "Battery": "40H" }' },
      { key: "keyFeatures", label: "Key feature cards", type: "json", section: "Details" },
      { key: "infoSections", label: "Info sections", type: "json", section: "Details" },
      { key: "faqs", label: "FAQs", type: "json", section: "Details", help: 'Example: [{ "q": "Question?", "a": "Answer." }]' },
      { key: "metaTitle", label: "Meta title", type: "text", section: "SEO" },
      { key: "metaDescription", label: "Meta description", type: "textarea", section: "SEO" },
      { key: "ogTitle", label: "Social share title", type: "text", section: "SEO" },
      { key: "ogDescription", label: "Social share description", type: "textarea", section: "SEO" },
      { key: "tags", label: "Tags", type: "list", section: "SEO", help: "One per line" },
      { key: "seoKeywords", label: "SEO keywords", type: "list", section: "SEO", help: "One per line" },
    ],
  },
  {
    id: "bundles",
    label: "Bundles",
    singular: "bundle",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "", render: (d) => thumb(d.image) },
      { label: "Bundle", render: (d) => <><span className="font-semibold text-white">{text(d.title)}</span><div className="text-white/35 text-xs">{text(d.subtitle)}</div></> },
      { label: "Products", render: (d) => (Array.isArray(d.products) ? d.products.join(", ") : "—") },
      { label: "Discount", render: (d) => `${text(d.discount)}%` },
      { label: "Tag", render: (d) => (d.tag ? pill(String(d.tag), "gold") : "—") },
    ],
    defaults: { products: [], discount: 0 },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "products", label: "Product IDs", type: "list", help: "One product ID per line, e.g. buds-pro" },
      { key: "discount", label: "Discount (%)", type: "number" },
      { key: "tag", label: "Tag", type: "text", help: 'e.g. "Coming Soon"' },
      { key: "image", label: "Image", type: "image" },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    singular: "category",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "", render: (d) => thumb(d.image) },
      { label: "Name", render: (d) => <span className="font-semibold text-white">{text(d.name)}</span> },
      { label: "Count", render: (d) => text(d.count) },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "image", label: "Image", type: "image" },
      { key: "count", label: "Product count shown", type: "number" },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    singular: "review",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "Customer", render: (d) => <><span className="font-semibold text-white">{text(d.name)}</span><div className="text-white/35 text-xs">{text(d.location)}</div></> },
      { label: "Product", render: (d) => text(d.product) },
      { label: "Rating", render: (d) => <span className="text-[#D4A520]">{"★".repeat(Number(d.rating) || 0)}</span> },
      { label: "Review", render: (d) => <span className="line-clamp-2 max-w-md">{text(d.review)}</span> },
      { label: "Date", render: (d) => text(d.date) },
    ],
    defaults: { rating: 5, verified: true, helpful: 0 },
    fields: [
      { key: "name", label: "Customer name", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "rating", label: "Rating (1–5)", type: "number", required: true },
      { key: "date", label: "Date shown", type: "text", help: "e.g. 12 Sep 2026" },
      { key: "product", label: "Product name shown", type: "text" },
      { key: "productId", label: "Product ID", type: "text", help: "Links the review to a product page, e.g. buds-pro" },
      { key: "review", label: "Review text", type: "textarea", required: true },
      { key: "verified", label: "Verified buyer", type: "boolean" },
      { key: "helpful", label: "Helpful votes", type: "number" },
      { key: "avatar", label: "Avatar URL", type: "text" },
    ],
  },
  {
    id: "coupons",
    label: "Coupons",
    singular: "coupon",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "Code", render: (d) => <span className="font-semibold text-white tracking-wider">{text(d.code)}</span> },
      { label: "Discount", render: (d) => `${text(d.discountPercent)}%` },
      { label: "Type", render: (d) => (d.user ? pill("Personal (cart reminder)", "grey") : pill("Public", "gold")) },
      { label: "Active", render: (d) => (d.active ? pill("Active", "green") : pill("Inactive", "red")) },
    ],
    defaults: { active: true, discountPercent: 10 },
    fields: [
      { key: "code", label: "Code", type: "text", required: true, help: "Saved in capital letters" },
      { key: "discountPercent", label: "Discount (%)", type: "number", required: true },
      { key: "active", label: "Active", type: "boolean" },
    ],
  },
  {
    id: "users",
    label: "Customers",
    singular: "customer",
    canCreate: false,
    canDelete: true,
    columns: [
      { label: "Name", render: (d) => <span className="font-semibold text-white">{text(d.name)}</span> },
      { label: "Email", render: (d) => text(d.email) },
      { label: "Phone", render: (d) => text(d.phone) },
      { label: "Joined", render: (d) => dateTime(d.createdAt) },
      { label: "Cart emails", render: (d) => (d.cartRemindersOptOut ? pill("Unsubscribed", "red") : pill("On", "green")) },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text", required: true },
      { key: "cartRemindersOptOut", label: "Stop cart reminder emails", type: "boolean" },
      { key: "wishlist", label: "Wishlist product IDs", type: "list" },
      { key: "addresses", label: "Saved addresses", type: "json" },
    ],
  },
  {
    id: "carts",
    label: "Abandoned carts",
    singular: "cart",
    canCreate: false,
    canDelete: true,
    columns: [
      { label: "Customer", render: (d) => <><span className="font-semibold text-white">{text(getPath(d, "user.name"))}</span><div className="text-white/35 text-xs">{text(getPath(d, "user.email"))}</div></> },
      { label: "Items", render: (d) => (Array.isArray(d.items) ? d.items.map((i) => `${(i as Doc).productId} × ${(i as Doc).quantity}`).join(", ") || "Empty" : "—") },
      { label: "Reminders sent", render: (d) => text(d.remindersSent) },
      { label: "Last change", render: (d) => dateTime(d.itemsUpdatedAt) },
    ],
    fields: [
      { key: "items", label: "Items", type: "json" },
      { key: "remindersSent", label: "Reminders sent", type: "number", help: "Set to 0 to restart the reminder sequence" },
    ],
  },
  {
    id: "subscribers",
    label: "Subscribers",
    singular: "subscriber",
    canCreate: true,
    canDelete: true,
    columns: [
      { label: "Email", render: (d) => <span className="font-semibold text-white">{text(d.email)}</span> },
      { label: "Subscribed", render: (d) => dateTime(d.createdAt) },
    ],
    fields: [{ key: "email", label: "Email", type: "text", required: true }],
  },
];
