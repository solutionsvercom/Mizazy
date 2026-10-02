import crypto from "crypto";
import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { optionalAuth, protect } from "../middleware/auth.js";
import { sendOrderEmails, sendPaymentConfirmationEmail, sendPaymentReceiptEmail } from "../mailer.js";
import { delhiveryTrackingUrl, isDelhiveryConfigured, isDelhiveryPartner, trackShipment } from "../delhivery.js";
import { getAllowedOrigins, getPublicSiteUrl } from "../config.js";
import { cashfreeMode, createCashfreeOrder, fetchCashfreePayment, isCashfreeConfigured } from "../cashfree.js";

const router = Router();

const STAGES = [
  { id: "confirmed", label: "Order Confirmed", desc: "Your order has been received and confirmed." },
  { id: "packed", label: "Packed", desc: "Your MIZAZY gadget has been carefully packed and quality-checked." },
  { id: "shipped", label: "Shipped", desc: "Handed over to our courier partner." },
  { id: "transit", label: "In Transit", desc: "Your package is on its way." },
  { id: "out", label: "Out for Delivery", desc: "Assigned to delivery agent." },
  { id: "delivered", label: "Delivered", desc: "Package delivered." },
];

function formatTime(date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

const AGE_OFFSETS = { express: [0, 0.2, 1, 4, 10, 20], standard: [0, 0.5, 2, 10, 28, 48] };

function progressFromAge(createdAt, delivery) {
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 36e5);
  const thresholds = AGE_OFFSETS[delivery === "express" ? "express" : "standard"];
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (hours >= thresholds[i]) idx = i;
  }
  return idx;
}

/** Maps a Delhivery status to a STAGES index, or "cancelled" / "returned". */
function courierStage(c) {
  const status = String(c?.status || "");
  const type = String(c?.statusType || "").toUpperCase();
  if (type === "RT" || /\brto\b|return/i.test(status)) return "returned";
  if (type === "CN" || /cancel/i.test(status)) return "cancelled";
  if (type === "DL" || /^delivered$/i.test(status)) return 5;
  if (/dispatched|out for delivery/i.test(status)) return 4;
  if (/not picked|manifest|pickup|scheduled/i.test(status) || type === "PP") return 1;
  if (/picked up/i.test(status) || type === "PU") return 2;
  if (/transit|pending|reached|received|bagged|connected/i.test(status)) return 3;
  return 2;
}

const isFinalCourierStatus = (c) => {
  const stage = courierStage(c);
  return stage === 5 || stage === "cancelled" || (stage === "returned" && String(c.statusType).toUpperCase() === "DL");
};

const courierText = (c) =>
  [c.status, c.location].filter(Boolean).join(" · ") + (c.instructions && c.instructions !== c.status ? ` — ${c.instructions}` : "");

function buildTimeline(json, idx, { manualAt, courier } = {}) {
  const start = new Date(json.createdAt);
  const offsets = AGE_OFFSETS[json.delivery === "express" ? "express" : "standard"];
  const legacy = !isDelhiveryPartner(json.shippingPartner);

  // Earliest courier scan for each stage, used as that stage's time.
  const stageTimes = {};
  for (const scan of courier?.scans || []) {
    const s = courierStage({ status: scan.status });
    if (typeof s === "number" && scan.time && (!stageTimes[s] || new Date(scan.time) < stageTimes[s])) stageTimes[s] = new Date(scan.time);
  }

  return STAGES.map((stage, i) => {
    let time = "—";
    if (i <= idx) {
      if (courier) {
        const t = i === 0 ? start : i === idx && courier.statusAt ? new Date(courier.statusAt) : stageTimes[i];
        time = t ? formatTime(t) : "—";
      } else {
        let t = new Date(start.getTime() + offsets[i] * 36e5);
        if (manualAt) t = i === idx ? manualAt : new Date(Math.min(t.getTime(), manualAt.getTime()));
        time = formatTime(t);
      }
    }
    let desc = stage.desc;
    if (stage.id === "shipped" && json.trackingNumber) {
      desc = `Handed over to ${json.shippingPartner || "our courier partner"}. Tracking: ${json.trackingNumber}`;
    }
    if (stage.id === "transit" && legacy) desc = `Your package is on its way. Currently at ${json.address?.city || "Mumbai"} Hub.`;
    if (courier && i === idx && i > 0) desc = courierText(courier) || desc;
    return { ...stage, desc, time, done: i < idx, active: i === idx };
  });
}

function haltedOrder(json, { label, desc, doneThrough, at, courier }) {
  const timeline = buildTimeline(json, doneThrough, { manualAt: at, courier }).map((s, i) => ({
    ...s,
    done: i <= doneThrough,
    active: false,
    time: i <= doneThrough ? s.time : "—",
  }));
  return { status: "cancelled", label, desc, timeline };
}

export function serializeOrder(order) {
  const json = order.toJSON ? order.toJSON() : { ...order };
  if (json.payment) json.payment = { ...json.payment, accessToken: undefined };
  const delhivery = isDelhiveryPartner(json.shippingPartner);
  const courier = json.courier?.status && json.courier.awb === json.trackingNumber ? json.courier : null;
  if (courier?.expectedDelivery) json.estimatedDelivery = courier.expectedDelivery;

  const extras = {
    trackingUrl: delhivery && json.trackingNumber ? delhiveryTrackingUrl(json.trackingNumber) : undefined,
    courierUpdates: (courier?.scans || []).slice(0, 30).map((s) => ({
      status: s.status,
      location: s.location,
      instructions: s.instructions,
      time: s.time ? formatTime(new Date(s.time)) : "",
    })),
  };
  const manualAt = json.statusUpdatedAt ? new Date(json.statusUpdatedAt) : null;
  const stage = courier ? courierStage(courier) : null;
  const finish = ({ status, label, desc, timeline }) => ({
    ...json,
    ...extras,
    timeline,
    status,
    currentStatusLabel: label,
    currentStatusDesc: desc,
  });

  if (json.statusSetByAdmin && json.status === "cancelled") {
    return finish(haltedOrder(json, { label: "Cancelled", desc: "This order has been cancelled.", doneThrough: 0, at: manualAt }));
  }
  if (stage === "cancelled") {
    return finish(haltedOrder(json, { label: "Cancelled", desc: courierText(courier) || "This shipment has been cancelled.", doneThrough: 0, courier }));
  }
  if (stage === "returned") {
    return finish({
      ...haltedOrder(json, { label: "Returned", desc: `This shipment is being returned to MIZAZY. ${courierText(courier)}`.trim(), doneThrough: 2, courier }),
      status: "returned",
    });
  }

  const manualIdx = json.statusSetByAdmin ? STAGES.findIndex((s) => s.id === json.status) : -1;
  const adminIsNewer = manualIdx >= 0 && (!courier || (manualAt && courier.statusAt && manualAt > new Date(courier.statusAt)));
  let timeline;
  if (courier && !adminIsNewer) {
    timeline = buildTimeline(json, stage, { courier });
  } else if (manualIdx >= 0) {
    timeline = buildTimeline(json, manualIdx, { manualAt });
  } else {
    const auto = progressFromAge(json.createdAt, json.delivery);
    // Real courier orders only move past "Packed" once Delhivery reports progress.
    timeline = buildTimeline(json, delhivery ? Math.min(auto, 1) : auto);
  }
  const active = timeline.find((s) => s.active) || timeline[timeline.length - 1];
  return finish({ status: active.id, label: active.label, desc: active.desc, timeline });
}

const TRACKING_TTL_MS = 15 * 60 * 1000;

/** Delivered COD shipments mean the cash was collected: mark paid and send the payment confirmation once. */
async function settleCodOnDelivery(order) {
  if (order.payment?.method !== "cod" || order.payment.status === "confirmed" || courierStage(order.courier) !== 5) return;
  const res = await Order.updateOne(
    { _id: order._id, "payment.status": { $ne: "confirmed" } },
    { $set: { "payment.status": "confirmed", "payment.paidAt": order.courier.statusAt || new Date() } }
  );
  if (!res.modifiedCount) return;
  const fresh = await Order.findById(order._id);
  const user = fresh.user ? await User.findById(fresh.user) : null;
  sendPaymentConfirmationEmail(fresh, user).catch((err) =>
    console.error(`Payment confirmation for ${fresh.orderNumber} failed:`, err.message)
  );
}

/** Pulls live Delhivery tracking for an order's AWB (cached for 15 minutes) and returns the up-to-date order. */
export async function refreshTracking(order, { force = false } = {}) {
  const awb = order.trackingNumber;
  if (!awb || !isDelhiveryPartner(order.shippingPartner) || !isDelhiveryConfigured()) return order;
  const prev = order.courier?.awb === awb ? order.courier : null;
  const fresh = prev?.fetchedAt && Date.now() - new Date(prev.fetchedAt).getTime() < TRACKING_TTL_MS;
  if (!force && prev && (fresh || (prev.status && isFinalCourierStatus(prev)))) return order;

  try {
    const latest = await trackShipment(awb);
    const updated = await Order.findByIdAndUpdate(order._id, { $set: { courier: latest } }, { new: true });
    await settleCodOnDelivery(updated);
    return updated;
  } catch (err) {
    const update = prev
      ? { "courier.fetchedAt": new Date(), "courier.error": err.message }
      : { courier: { awb, fetchedAt: new Date(), error: err.message } };
    const updated = await Order.findByIdAndUpdate(order._id, { $set: update }, { new: true });
    if (force) throw err;
    return updated;
  }
}

/** Keeps open Delhivery shipments current so admin views and COD settlement don't wait for a customer visit. */
export function startShipmentTracking() {
  const run = async () => {
    if (!isDelhiveryConfigured()) return;
    try {
      const open = await Order.find({
        trackingNumber: { $nin: [null, ""] },
        shippingPartner: /delhivery/i,
        createdAt: { $gte: new Date(Date.now() - 45 * 864e5) },
      });
      for (const order of open) await refreshTracking(order);
    } catch (err) {
      console.error("Shipment tracking refresh failed:", err.message);
    }
  };
  setTimeout(run, 60 * 1000);
  setInterval(run, 60 * 60 * 1000);
}

/** Unpaid online orders stay hidden from the customer's order list and tracking. */
const VISIBLE_TO_CUSTOMER = { $nor: [{ "payment.gateway": "cashfree", "payment.status": { $ne: "confirmed" } }] };

/** Reduces stock, clears the saved cart, uses up a personal coupon and sends emails — exactly once per order. */
async function finalizeOrder(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, finalized: { $ne: true } },
    { $set: { finalized: true } },
    { new: true }
  );
  if (!order) return null;

  await Promise.all(
    order.items.map((i) =>
      Product.updateOne({ id: i.productId }, [
        { $set: { stock: { $max: [0, { $subtract: ["$stock", i.quantity] }] } } },
      ])
    )
  );
  const user = order.user ? await User.findById(order.user) : null;
  if (user) {
    await Cart.updateOne({ user: user._id }, { $set: { items: [], remindersSent: 0, lastReminderAt: null } });
    // Personal abandoned-cart codes are single use; a new abandonment re-activates it.
    if (order.coupon) await Coupon.updateOne({ code: order.coupon, user: user._id }, { $set: { active: false } });
  }

  sendOrderEmails(order, user);
  if (order.payment?.gateway === "cashfree") sendPaymentReceiptEmail(order, user);
  return order;
}

/** Asks Cashfree for the latest payment result and confirms + finalizes the order when it is paid. */
export async function syncCashfreePayment(order) {
  if (order.payment?.gateway !== "cashfree" || order.payment.status === "confirmed") return order;
  const result = await fetchCashfreePayment(order.orderNumber);

  if (result.paid) {
    if (Math.abs(result.amount - order.totals.total) > 0.01) {
      console.error(`Cashfree amount mismatch for ${order.orderNumber}: paid ${result.amount}, expected ${order.totals.total}`);
      return order;
    }
    const p = result.payment || {};
    await Order.updateOne(
      { _id: order._id, "payment.status": { $ne: "confirmed" } },
      {
        $set: {
          "payment.status": "confirmed",
          "payment.cfPaymentId": p.cf_payment_id ? String(p.cf_payment_id) : undefined,
          "payment.paymentGroup": p.payment_group,
          "payment.paidAt": p.payment_completion_time ? new Date(p.payment_completion_time) : new Date(),
        },
      }
    );
    await finalizeOrder(order._id);
  } else if (["EXPIRED", "TERMINATED"].includes(result.orderStatus)) {
    await Order.updateOne({ _id: order._id, "payment.status": "pending" }, { $set: { "payment.status": "failed" } });
  }
  return Order.findById(order._id);
}

function siteBase(req) {
  const origin = req.get("origin");
  if (origin && getAllowedOrigins().includes(origin)) return origin.replace(/\/+$/, "");
  return getPublicSiteUrl();
}

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, address, delivery = "standard", payment, coupon } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!address?.name || !address?.phone || !address?.address || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ message: "Complete delivery address is required" });
    }
    const method = ["upi", "card", "netbanking", "cod"].includes(payment?.method) ? payment.method : "upi";
    const online = method !== "cod";
    if (online && !isCashfreeConfigured()) {
      return res.status(503).json({ message: "Online payment is not available right now. Please choose Cash on Delivery." });
    }

    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({ id: { $in: productIds } });
    const byId = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

    const orderItems = [];
    let subtotal = 0;
    let mrpTotal = 0;

    for (const item of items) {
      const product = byId[item.productId];
      if (!product) return res.status(400).json({ message: `Product ${item.productId} not found` });
      const qty = Math.max(1, Math.min(10, Number(item.quantity) || 1));
      if (product.stock < qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        color: item.color,
        colorName: item.colorName,
        quantity: qty,
        price: product.price,
        mrp: product.mrp,
      });
      subtotal += product.price * qty;
      mrpTotal += product.mrp * qty;
    }

    let couponDiscount = 0;
    let couponCode;
    if (coupon) {
      const found = await Coupon.findOne({ code: String(coupon).toUpperCase().trim(), active: true });
      if (found && (!found.user || (req.user && found.user.equals(req.user._id)))) {
        couponDiscount = Math.round(subtotal * (found.discountPercent / 100));
        couponCode = found.code;
      }
    }

    const shipping = delivery === "express" ? 149 : subtotal >= 999 ? 0 : 99;
    const total = subtotal - couponDiscount + shipping;
    const orderNumber = "MZ-" + Date.now().toString().slice(-8);
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + (delivery === "express" ? 1 : 4));

    const order = await Order.create({
      orderNumber,
      user: req.user?._id,
      phone: address.phone,
      email: req.user?.email,
      address,
      items: orderItems,
      delivery,      payment: {
        method,
        status: "pending",
        ...(online ? { gateway: "cashfree", accessToken: crypto.randomBytes(24).toString("hex") } : {}),
      },
      coupon: couponCode,
      totals: {
        subtotal,
        discount: mrpTotal - subtotal,
        couponDiscount,
        shipping,
        total,
      },
      status: "confirmed",
      shippingPartner: "Delhivery",
      estimatedDelivery: estimated,
    });

    if (!online) {
      await finalizeOrder(order._id);
      return res.status(201).json(serializeOrder(order));
    }

    const token = order.payment.accessToken;
    let base = siteBase(req);
    // Cashfree production only accepts https return URLs.
    if (cashfreeMode() === "production" && !base.startsWith("https://")) base = getPublicSiteUrl();
    try {
      const session = await createCashfreeOrder({
        order,
        customerId: req.user ? String(req.user._id) : `guest_${String(address.phone).replace(/\D/g, "")}`,
        returnUrl: `${base}/payment-status?order=${encodeURIComponent(orderNumber)}&t=${token}`,
        notifyUrl: process.env.NODE_ENV === "production" ? `${getPublicSiteUrl()}/api/payments/cashfree/webhook` : undefined,
      });
      await Order.updateOne({ _id: order._id }, { $set: { "payment.cfOrderId": String(session.cfOrderId) } });
      res.status(201).json({
        ...serializeOrder(order),
        cashfree: { paymentSessionId: session.paymentSessionId, token },
      });
    } catch (err) {
      await Order.updateOne({ _id: order._id }, { $set: { "payment.status": "failed" } });
      console.error(`Cashfree order ${orderNumber} failed:`, err.message);
      res.status(502).json({ message: "Could not start the payment. Please try again or choose Cash on Delivery." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/track", protect, async (req, res) => {
  try {
    const orderNumber = String(req.query.orderNumber || "").trim().toUpperCase();
    if (!orderNumber) return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findOne({ orderNumber, user: req.user._id, ...VISIBLE_TO_CUSTOMER });
    if (!order) return res.status(404).json({ message: "No order with this ID on your account" });
    res.json(serializeOrder(await refreshTracking(order)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, ...VISIBLE_TO_CUSTOMER }).sort({ createdAt: -1 });
    const current = await Promise.all(orders.map((o) => refreshTracking(o)));
    res.json(current.map(serializeOrder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:orderNumber", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(serializeOrder(await refreshTracking(order)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
