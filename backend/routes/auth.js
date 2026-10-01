import crypto from "crypto";
import { Router } from "express";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../mailer.js";
import { getAllowedOrigins, getPublicSiteUrl } from "../config.js";

const router = Router();

const RESET_MINUTES = 30;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/** Origin is only trusted when allow-listed, so a forged header can't redirect reset links elsewhere. */
function resetLinkBase(req) {
  const origin = String(req.get("origin") || "").replace(/\/+$/, "");
  if (origin && getAllowedOrigins().includes(origin)) return origin;
  return getPublicSiteUrl();
}

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
    sendWelcomeEmail(user);
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

router.post("/forgot-password", async (req, res) => {
  const genericReply = {
    message: "If an account exists for this email, a password reset link has been sent. Please check your inbox.",
  };
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.json(genericReply);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordHash = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
    await user.save();

    const resetUrl = `${resetLinkBase(req)}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    try {
      await sendPasswordResetEmail(user, resetUrl, RESET_MINUTES);
    } catch (err) {
      console.error("Password reset email failed:", err.message);
      return res.status(503).json({ message: "We couldn't send the reset email right now. Please try again later." });
    }
    res.json(genericReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");
    if (!email || !token) return res.status(400).json({ message: "This reset link is invalid. Please request a new one." });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email }).select("+resetPasswordHash +resetPasswordExpires");
    const valid =
      user?.resetPasswordHash &&
      user.resetPasswordExpires > new Date() &&
      crypto.timingSafeEqual(Buffer.from(user.resetPasswordHash), Buffer.from(hashToken(token)));
    if (!valid) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    user.password = password;
    user.resetPasswordHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
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
