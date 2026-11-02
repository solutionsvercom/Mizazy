import { Router } from "express";
import multer from "multer";
import Product from "../models/Product.js";
import WarrantyClaim from "../models/WarrantyClaim.js";
import { uploadBuffer } from "../cloudinary.js";
import { sendWarrantyClaimEmails } from "../mailer.js";

const router = Router();

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP, HEIC, and PDF invoices are allowed"));
    }
    cb(null, true);
  },
});

const attempts = new Map();
function tooManyClaims(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 8;
}

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function nextClaimNumber() {
  return "WC-" + Date.now().toString().slice(-8);
}

router.post("/", upload.single("invoice"), async (req, res) => {
  try {
    const productId = String(req.body.productId || "").trim();
    const name = String(req.body.name || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!productId) return res.status(400).json({ message: "Choose the product you want to claim warranty for" });
    if (name.length < 2) return res.status(400).json({ message: "Enter your full name" });
    if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ message: "Enter a valid 10-digit mobile number" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (!req.file) return res.status(400).json({ message: "Upload your purchase invoice (photo or PDF)" });
    if (tooManyClaims(req.ip)) {
      return res.status(429).json({ message: "Too many warranty claims from this connection. Please try again in an hour." });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(400).json({ message: "That product is not available for a warranty claim" });

    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: "warranty",
      cloudinary: { resource_type: "auto" },
    });

    let claim;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        claim = await WarrantyClaim.create({
          claimNumber: nextClaimNumber(),
          productId: product.id,
          productName: product.name,
          name,
          phone,
          email,
          invoiceUrl: uploaded.secure_url,
          invoicePublicId: uploaded.public_id || "",
        });
        break;
      } catch (err) {
        if (err.code !== 11000 || attempt === 2) throw err;
      }
    }

    const emailed = await sendWarrantyClaimEmails(claim);
    if (emailed) {
      claim.emailSent = true;
      await claim.save();
    }

    res.status(201).json({
      claimNumber: claim.claimNumber,
      email: claim.email,
      emailed,
    });
  } catch (err) {
    console.error("Warranty claim failed:", err);
    res.status(500).json({ message: err.message || "Could not submit your warranty claim" });
  }
});

export default router;
