import { Router } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { isValidUnsubscribe } from "../cartReminders.js";
import { getPublicSiteUrl } from "../config.js";

const router = Router();

const cartKey = (items) =>
  JSON.stringify(items.map((i) => [i.productId, i.quantity, i.color || ""]).sort());

router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.json({ items: cart?.items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", protect, async (req, res) => {
  try {
    const raw = Array.isArray(req.body.items) ? req.body.items.slice(0, 50) : [];
    const known = new Set(
      (await Product.find({ id: { $in: raw.map((i) => String(i?.productId || "")) } }, { id: 1 })).map((p) => p.id)
    );
    const items = raw
      .filter((i) => known.has(String(i?.productId || "")))
      .map((i) => ({
        productId: String(i.productId),
        quantity: Math.max(1, Math.min(10, Number(i.quantity) || 1)),
        color: String(i.color || "").slice(0, 40),
        colorName: String(i.colorName || "").slice(0, 60),
      }));

    const cart = (await Cart.findOne({ user: req.user._id })) || new Cart({ user: req.user._id });
    if (!items.length) {
      cart.items = [];
      cart.remindersSent = 0;
      cart.lastReminderAt = null;
    } else if (cartKey(items) !== cartKey(cart.items)) {
      cart.items = items;
      cart.itemsUpdatedAt = new Date();
    }
    await cart.save();
    res.json({ items: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/unsubscribe", async (req, res) => {
  const site = getPublicSiteUrl();
  const page = (message) =>
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>MIZAZY</title></head>
     <body style="margin:0;background:#050505;color:#fff;font-family:Arial,Helvetica,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px;">
       <div><div style="color:#D4A520;font-size:24px;font-weight:bold;letter-spacing:3px;">MIZAZY</div>
       <p style="font-size:16px;margin:20px 0;">${message}</p>
       <a href="${site}" style="color:#D4A520;">Continue shopping</a></div></body></html>`;
  try {
    const { u, s } = req.query;
    if (!u || !isValidUnsubscribe(u, s)) return res.status(400).send(page("This unsubscribe link is invalid."));
    await User.updateOne({ _id: u }, { $set: { cartRemindersOptOut: true } });
    res.send(page("You won't receive cart reminder emails anymore."));
  } catch {
    res.status(400).send(page("This unsubscribe link is invalid."));
  }
});

export default router;
