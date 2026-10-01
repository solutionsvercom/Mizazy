import { Router } from "express";
import Review from "../models/Review.js";
import Subscriber from "../models/Subscriber.js";
import Category from "../models/Category.js";
import Bundle from "../models/Bundle.js";
import Coupon from "../models/Coupon.js";
import { catalogPayload } from "./products.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/catalog", async (_req, res) => {
  try {
    res.json(await catalogPayload());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/categories", async (_req, res) => {
  res.json(await Category.find());
});

router.get("/bundles", async (_req, res) => {
  res.json(await Bundle.find());
});

router.get("/reviews", async (req, res) => {
  const filter = req.query.productId ? { productId: req.query.productId } : {};
  res.json(await Review.find(filter).sort({ createdAt: -1 }));
});

router.post("/reviews", optionalAuth, async (req, res) => {
  try {
    const { name, location, rating, product, productId, review } = req.body;
    if (!review || !rating || !productId) {
      return res.status(400).json({ message: "Review, rating and product are required" });
    }
    const created = await Review.create({
      name: name || req.user?.name || "MIZAZY Customer",
      location: location || "",
      rating,
      date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      product,
      productId,
      review,
      verified: Boolean(req.user),
      helpful: 0,
      avatar: (name || req.user?.name || "MC")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      user: req.user?._id,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/coupons/validate", optionalAuth, async (req, res) => {
  try {
    const code = String(req.body.code || "").toUpperCase().trim();
    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (coupon.user) {
      if (!req.user) return res.status(401).json({ message: "Please sign in to use this personal coupon" });
      if (!coupon.user.equals(req.user._id)) return res.status(403).json({ message: "This coupon belongs to another account" });
    }
    res.json({ code: coupon.code, discountPercent: coupon.discountPercent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/newsletter", async (req, res) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email.includes("@")) return res.status(400).json({ message: "Enter a valid email" });
    await Subscriber.updateOne({ email }, { email }, { upsert: true });
    res.json({ ok: true, message: "You're in! Welcome to MIZAZY." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
