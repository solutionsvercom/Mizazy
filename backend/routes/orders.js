import crypto from "crypto";
import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { optionalAuth, protect } from "../middleware/auth.js";import { sendOrderEmails, sendPaymentReceiptEmail } from "../mailer.js";
import { getAllowedOrigins, getPublicSiteUrl } from "../config.js";
import { cashfreeMode, createCashfreeOrder, fetchCashfreePayment, isCashfreeConfigured } from "../cashfree.js";

const router = Router();

const STAGES = [
  { id: "confirmed", label: "Order Confirmed", desc: "Your order has been received and confirmed." },
  { id: "packed", label: "Packed", desc: "Your MIZAZY gadget has been carefully packed and quality-checked." },
  { id: "shipped", label: "Shipped", desc: "Handed over to BlueDart logistics." },
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
  });
}

function progressFromAge(createdAt, delivery) {
  const hours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 36e5);
  const thresholds = delivery === "express" ? [0, 0.2, 1, 4, 10, 20] : [0, 0.5, 2, 10, 28, 48];
  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (hours >= thresholds[i]) idx = i;
  }
  return idx;
}

function buildTimeline(createdAt, delivery, trackingNumber, city, manual) {
  const idx = manual ? manual.idx : progressFromAge(createdAt, delivery);
  const start = new Date(createdAt);
  const hoursOffset = delivery === "express" ? [0, 0.2, 1, 4, 10, 20] : [0, 0.5, 2, 10, 28, 48];

  return STAGES.map((stage, i) => {
    let t = new Date(start.getTime() + hoursOffset[i] * 36e5);
    if (manual?.at) t = i === idx ? manual.at : new Date(Math.min(t.getTime(), manual.at.getTime()));
    let desc = stage.desc;
    if (stage.id === "shipped") desc = `Handed over to BlueDart logistics. Tracking: ${trackingNumber}`;
    if (stage.id === "transit") desc = `Your package is on its way. Currently at ${city || "Mumbai"} Hub.`;
    return {
      ...stage,
      time: i <= idx ? formatTime(t) : "—",
      done: i < idx,
      active: i === idx,
    };
  });
}

export function serializeOrder(order) {
  const json = order.toJSON ? order.toJSON() : { ...order };
  if (json.payment) json.payment = { ...json.payment, accessToken: undefined };
  const manualIdx = json.statusSetByAdmin ? STAGES.findIndex((s) => s.id === json.status) : -1;
  const manualAt = json.statusUpdatedAt ? new Date(json.statusUpdatedAt) : null;

  if (json.statusSetByAdmin && json.status === "cancelled") {
    const timeline = buildTimeline(json.createdAt, json.delivery, json.trackingNumber, json.address?.city, {
      idx: 0,
      at: manualAt,
    }).map((s, i) => ({ ...s, done: i === 0, active: false, time: i === 0 ? s.time : "—" }));
    return {
      ...json,
      timeline,
      status: "cancelled",
      currentStatusLabel: "Cancelled",
      currentStatusDesc: "This order has been cancelled.",
    };
  }

  const timeline = buildTimeline(
    json.createdAt,
    json.delivery,
    json.trackingNumber,
    json.address?.city,
    manualIdx >= 0 ? { idx: manualIdx, at: manualAt } : undefined
  );
  const active = timeline.find((s) => s.active) || timeline[timeline.length - 1];
  return {
    ...json,
    timeline,
    status: active.id,
    currentStatusLabel: active.label,
    currentStatusDesc: active.desc,
  };
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
    const trackingNumber = "BD" + Date.now().toString().slice(-10);
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
      trackingNumber,
      shippingPartner: "BlueDart Express",
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
    res.json(serializeOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, ...VISIBLE_TO_CUSTOMER }).sort({ createdAt: -1 });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:orderNumber", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(serializeOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
