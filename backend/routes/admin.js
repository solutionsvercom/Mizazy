import { Router } from "express";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Bundle from "../models/Bundle.js";
import Review from "../models/Review.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Subscriber from "../models/Subscriber.js";
import Cart from "../models/Cart.js";
import { requireAdmin, signAdminToken } from "../middleware/adminAuth.js";
import { refreshTracking, serializeOrder } from "./orders.js";
import { createShipment, isDelhiveryConfigured, isDelhiveryPartner } from "../delhivery.js";
import { sendPaymentConfirmationEmail } from "../mailer.js";

const router = Router();

const ORDER_STATUSES = ["confirmed", "packed", "shipped", "transit", "out", "delivered", "cancelled"];
const ALWAYS_READ_ONLY = ["_id", "__v", "createdAt", "updatedAt"];

/**
 * Collections the admin panel can manage.
 * search: fields matched by the search box · readOnly: never writable from the panel.
 */
const COLLECTIONS = {
  products: { model: Product, search: ["name", "id", "category", "slug", "tagline"], sort: { createdAt: 1 } },
  categories: { model: Category, search: ["name"], sort: { name: 1 } },
  bundles: { model: Bundle, search: ["title", "subtitle", "tag"], sort: { _id: 1 } },
  reviews: { model: Review, search: ["name", "product", "productId", "review", "location"], sort: { createdAt: -1 } },
  coupons: { model: Coupon, search: ["code"], sort: { code: 1 } },
  orders: {
    model: Order,
    search: ["orderNumber", "phone", "email", "address.name", "address.city", "trackingNumber"],
    sort: { createdAt: -1 },
    noCreate: true,
    readOnly: ["orderNumber", "user", "statusSetByAdmin", "statusUpdatedAt", "timeline", "finalized", "courier"],
  },
  users: {
    model: User,
    search: ["name", "email", "phone"],
    sort: { createdAt: -1 },
    noCreate: true,
    readOnly: ["password", "resetPasswordHash", "resetPasswordExpires"],
  },
  subscribers: { model: Subscriber, search: ["email"], sort: { createdAt: -1 } },
  carts: {
    model: Cart,
    search: [],
    sort: { updatedAt: -1 },
    noCreate: true,
    populate: { path: "user", select: "name email phone" },
    readOnly: ["user"],
  },
};

// Basic brute-force protection for the admin login: 10 attempts per IP per 15 minutes.
const loginAttempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

router.post("/login", async (req, res) => {
  try {
    if (tooManyAttempts(req.ip)) {
      return res.status(429).json({ message: "Too many sign-in attempts. Please try again in 15 minutes." });
    }
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const admin = email ? await Admin.findOne({ email }).select("+password") : null;
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid admin email or password" });
    }
    loginAttempts.delete(req.ip);
    res.json({ token: signAdminToken(admin._id), admin: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.use(requireAdmin);

router.get("/me", (req, res) => res.json(req.admin.toJSON()));

router.post("/change-password", async (req, res) => {
  try {
    const current = String(req.body.currentPassword || "");
    const next = String(req.body.newPassword || "");
    if (next.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!(await admin.matchPassword(current))) return res.status(400).json({ message: "Current password is incorrect" });
    if (current === next) return res.status(400).json({ message: "New password must be different from the current one" });
    admin.password = next;
    await admin.save();
    res.json({ message: "Password changed", token: signAdminToken(admin._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [products, orders, users, subscribers, coupons, reviews, ordersToday, revenue, activeCarts, lowStock, recent] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Subscriber.countDocuments(),
        Coupon.countDocuments({ active: true }),
        Review.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.aggregate([
          { $match: { isTest: { $ne: true }, status: { $ne: "cancelled" }, "payment.status": { $ne: "failed" }, $nor: [{ "payment.gateway": "cashfree", "payment.status": { $ne: "confirmed" } }] } },
          { $group: { _id: null, total: { $sum: "$totals.total" } } },
        ]),
        Cart.countDocuments({ "items.0": { $exists: true } }),
        Product.find({ stock: { $lt: 5 } }, { id: 1, name: 1, stock: 1 }).sort({ stock: 1 }).limit(10),
        Order.find().sort({ createdAt: -1 }).limit(8),
      ]);
    res.json({
      counts: { products, orders, users, subscribers, coupons, reviews, ordersToday, activeCarts },
      revenue: revenue[0]?.total || 0,
      lowStock,
      recentOrders: recent.map(serializeOrder),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function collectionFor(req, res) {
  const config = COLLECTIONS[req.params.collection];
  if (!config) res.status(404).json({ message: "Unknown collection" });
  return config;
}

function writableFields(config, body) {
  const blocked = new Set([...ALWAYS_READ_ONLY, ...(config.readOnly || [])]);
  const out = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (!blocked.has(key) && !key.startsWith("$") && !key.includes(".")) out[key] = value;
  }
  return out;
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function serialize(name, doc) {
  return name === "orders" ? serializeOrder(doc) : doc.toJSON();
}

router.get("/:collection", async (req, res) => {
  const config = collectionFor(req, res);
  if (!config) return;
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const q = String(req.query.q || "").trim();
    const filter = q && config.search.length
      ? { $or: config.search.map((field) => ({ [field]: new RegExp(escapeRegex(q), "i") })) }
      : {};
    let query = config.model.find(filter).sort(config.sort).skip((page - 1) * limit).limit(limit);
    if (config.populate) query = query.populate(config.populate);
    const [docs, total] = await Promise.all([query, config.model.countDocuments(filter)]);
    res.json({ items: docs.map((d) => serialize(req.params.collection, d)), total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:collection/:id", async (req, res) => {
  const config = collectionFor(req, res);
  if (!config) return;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });
    let query = config.model.findById(req.params.id);
    if (config.populate) query = query.populate(config.populate);
    const doc = await query;
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(serialize(req.params.collection, doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:collection", async (req, res) => {
  const config = collectionFor(req, res);
  if (!config) return;
  if (config.noCreate) return res.status(405).json({ message: "Items in this section can't be created from the admin panel" });
  try {
    const doc = await config.model.create(writableFields(config, req.body));
    res.status(201).json(serialize(req.params.collection, doc));
  } catch (err) {
    res.status(err.name === "ValidationError" || err.code === 11000 ? 400 : 500).json({
      message: err.code === 11000 ? "An item with this unique value already exists" : err.message,
    });
  }
});

router.post("/orders/:id/payment-email", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.payment?.status !== "confirmed") {
      return res.status(400).json({ message: 'Set Payment status to "Confirmed / Paid" and save before sending the payment confirmation.' });
    }
    const user = order.user ? await User.findById(order.user) : null;
    await sendPaymentConfirmationEmail(order, user);
    res.json({ message: `Payment confirmation sent to ${order.email || user?.email} from payment@mizazy.com` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/orders/:id/delhivery/create", async (req, res) => {
  try {
    if (!isDelhiveryConfigured()) return res.status(400).json({ message: "Delhivery is not configured. Add DELHIVERY_API_TOKEN first." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.trackingNumber && isDelhiveryPartner(order.shippingPartner)) {
      return res.status(400).json({ message: `This order already has a Delhivery AWB (${order.trackingNumber}).` });
    }
    if (order.payment?.gateway === "cashfree" && order.payment.status !== "confirmed") {
      return res.status(400).json({ message: "This online order is not paid yet, so it can't be shipped." });
    }
    const awb = await createShipment(order);
    const updated = await Order.findByIdAndUpdate(
      order._id,
      { $set: { trackingNumber: awb, shippingPartner: "Delhivery", statusSetByAdmin: false }, $unset: { courier: 1 } },
      { new: true }
    );
    const tracked = await refreshTracking(updated);
    res.json({ message: `Delhivery shipment created. AWB: ${awb}`, order: serializeOrder(tracked) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/orders/:id/delhivery/refresh", async (req, res) => {
  try {
    if (!isDelhiveryConfigured()) return res.status(400).json({ message: "Delhivery is not configured. Add DELHIVERY_API_TOKEN first." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.trackingNumber || !isDelhiveryPartner(order.shippingPartner)) {
      return res.status(400).json({ message: 'Add the Delhivery AWB as the tracking number (shipping partner "Delhivery") and save first.' });
    }
    const tracked = await refreshTracking(order, { force: true });
    const c = tracked.courier || {};
    res.json({
      message: `Delhivery: ${[c.status, c.location].filter(Boolean).join(" · ") || "no scans yet"}`,
      order: serializeOrder(tracked),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:collection/:id", async (req, res) => {
  const config = collectionFor(req, res);
  if (!config) return;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });
    const doc = await config.model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const updates = writableFields(config, req.body);
    if (req.params.collection === "orders" && updates.status !== undefined) {
      if (!ORDER_STATUSES.includes(updates.status)) return res.status(400).json({ message: "Invalid order status" });
      // Re-saving the status the tracker already shows shouldn't freeze automatic progress.
      const shown = serializeOrder(doc).status;
      if (updates.status !== shown || doc.statusSetByAdmin) {
        updates.statusSetByAdmin = true;
        if (updates.status !== doc.status || !doc.statusSetByAdmin) updates.statusUpdatedAt = new Date();
      }
    }
    const awbChanged =
      req.params.collection === "orders" &&
      ((updates.trackingNumber !== undefined && updates.trackingNumber !== doc.trackingNumber) ||
        (updates.shippingPartner !== undefined && updates.shippingPartner !== doc.shippingPartner));
    const markedPaid =
      req.params.collection === "orders" && updates.payment?.status === "confirmed" && doc.payment?.status !== "confirmed";
    if (markedPaid && !updates.payment.paidAt) updates.payment = { ...updates.payment, paidAt: new Date() };
    // findByIdAndUpdate (not doc.save) because Product has a field named "isNew", which clashes with Mongoose internals.
    let query = config.model.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (config.populate) query = query.populate(config.populate);
    let updated = await query;
    if (awbChanged) updated = await refreshTracking(updated, { force: false }).catch(() => updated);
    let paymentEmail;
    if (markedPaid) {
      try {
        await sendPaymentConfirmationEmail(updated, updated.user ? await User.findById(updated.user) : null);
        paymentEmail = "sent";
      } catch (err) {
        paymentEmail = err.message;
      }
    }
    res.json({ ...serialize(req.params.collection, updated), ...(paymentEmail ? { paymentEmail } : {}) });
  } catch (err) {
    res.status(err.name === "ValidationError" || err.name === "CastError" || err.code === 11000 ? 400 : 500).json({
      message: err.code === 11000 ? "An item with this unique value already exists" : err.message,
    });
  }
});

router.delete("/:collection/:id", async (req, res) => {
  const config = collectionFor(req, res);
  if (!config) return;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Not found" });
    const doc = await config.model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (req.params.collection === "users") {
      await Promise.all([Cart.deleteMany({ user: doc._id }), Coupon.deleteMany({ user: doc._id })]);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
