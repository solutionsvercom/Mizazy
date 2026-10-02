import crypto from "crypto";
import { Router } from "express";
import Order from "../models/Order.js";
import { optionalAuth } from "../middleware/auth.js";
import { cashfreeMode, isCashfreeConfigured, verifyCashfreeWebhook } from "../cashfree.js";
import { serializeOrder, syncCashfreePayment } from "./orders.js";

const router = Router();

router.get("/config", (_req, res) => {
  res.json({ cashfree: isCashfreeConfigured(), mode: cashfreeMode() });
});

const tokensMatch = (a, b) => {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length > 0 && x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Called by the checkout after the Cashfree popup closes, and by the /payment-status return page. */
router.post("/cashfree/verify", optionalAuth, async (req, res) => {
  try {
    const orderNumber = String(req.body.orderNumber || "").trim().toUpperCase();
    const order = await Order.findOne({ orderNumber, "payment.gateway": "cashfree" }).select("+payment.accessToken");
    const isOwner = order?.user && req.user && order.user.equals(req.user._id);
    if (!order || !(isOwner || tokensMatch(req.body.token, order.payment.accessToken))) {
      return res.status(404).json({ message: "Order not found" });
    }
    const latest = await syncCashfreePayment(order);
    res.json({ paymentStatus: latest.payment.status, order: serializeOrder(latest) });
  } catch (err) {
    console.error("Cashfree verify failed:", err.message);
    res.status(502).json({ message: "Could not check the payment status. Please try again in a moment." });
  }
});

router.post("/cashfree/webhook", async (req, res) => {
  if (!verifyCashfreeWebhook(req.rawBody, req.get("x-webhook-timestamp"), req.get("x-webhook-signature"))) {
    return res.status(401).json({ message: "Invalid signature" });
  }
  try {
    const orderNumber = req.body?.data?.order?.order_id;
    const order = orderNumber ? await Order.findOne({ orderNumber, "payment.gateway": "cashfree" }) : null;
    if (order) await syncCashfreePayment(order);
    res.json({ ok: true });
  } catch (err) {
    console.error("Cashfree webhook failed:", err.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

export default router;
