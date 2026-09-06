import { Router } from "express";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Name, email, phone and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });

    const user = await User.create({ name, email, phone, password });
    res.status(201).json({
      token: signToken(user._id),
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password || ""))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user._id), user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user.toJSON());
});

router.put("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json(req.user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/addresses", protect, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    if (!name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: "Complete address is required" });
    }
    if (req.user.addresses.length === 0) {
      req.user.addresses.push({ name, phone, address, city, state, pincode, isDefault: true });
    } else {
      req.user.addresses.push({ name, phone, address, city, state, pincode });
    }
    await req.user.save();
    res.json(req.user.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/wishlist", protect, async (req, res) => {
  res.json(req.user.wishlist);
});

router.post("/wishlist/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  if (!req.user.wishlist.includes(productId)) {
    req.user.wishlist.push(productId);
    await req.user.save();
  }
  res.json(req.user.wishlist);
});

router.delete("/wishlist/:productId", protect, async (req, res) => {
  req.user.wishlist = req.user.wishlist.filter((id) => id !== req.params.productId);
  await req.user.save();
  res.json(req.user.wishlist);
});

export default router;
