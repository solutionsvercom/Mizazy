import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import { optionalAuth, protect } from "../middleware/auth.js";

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

function buildTimeline(createdAt, delivery, trackingNumber, city) {
  const idx = progressFromAge(createdAt, delivery);
  const start = new Date(createdAt);
  const hoursOffset = delivery === "express" ? [0, 0.2, 1, 4, 10, 20] : [0, 0.5, 2, 10, 28, 48];

  return STAGES.map((stage, i) => {
    const t = new Date(start.getTime() + hoursOffset[i] * 36e5);
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

function serializeOrder(order) {
  const json = order.toJSON ? order.toJSON() : order;
  const timeline = buildTimeline(
    json.createdAt,
    json.delivery,
    json.trackingNumber,
    json.address?.city
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

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, address, delivery = "standard", payment, coupon } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (!address?.name || !address?.phone || !address?.address || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ message: "Complete delivery address is required" });
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
      product.stock -= qty;
    }

    let couponDiscount = 0;
    let couponCode;
    if (coupon) {
      const found = await Coupon.findOne({ code: String(coupon).toUpperCase(), active: true });
      if (found) {
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
      delivery,
      payment: {
        method: payment?.method || "upi",
        status: payment?.method === "cod" ? "pending" : "confirmed",
        upiId: payment?.upiId,
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

    await Promise.all(dbProducts.map((p) => p.save()));

    res.status(201).json(serializeOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/track", async (req, res) => {
  try {
    const orderNumber = String(req.query.orderNumber || "").trim();
    const phone = String(req.query.phone || "").trim();
    if (!orderNumber) return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findOne({ orderNumber: new RegExp(`^${orderNumber}$`, "i") });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (phone && order.phone !== phone) {
      return res.status(404).json({ message: "Order not found for this mobile number" });
    }
    res.json(serializeOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:orderNumber", optionalAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(serializeOrder(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
