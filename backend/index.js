import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
import cors from "cors";
import compression from "compression";
import multer from "multer";
import { connectDb } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import catalogRoutes from "./routes/catalog.js";
import uploadRoutes from "./routes/upload.js";
import cartRoutes from "./routes/cart.js";
import { getAllowedOrigins, getAppUrl } from "./config.js";
import { configureCloudinary } from "./cloudinary.js";
import { verifyMailer } from "./mailer.js";
import { startCartReminders } from "./cartReminders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT || 5000);
const publicDir = path.join(__dirname, "public");
const allowedOrigins = getAllowedOrigins();

app.set("trust proxy", 1);
app.use(compression());

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / server-to-server / Hostinger health checks often omit Origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    brand: "MIZAZY",
    appUrl: getAppUrl(),
    time: new Date().toISOString(),
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", catalogRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

if (fs.existsSync(publicDir)) {
  app.use(
    express.static(publicDir, {
      setHeaders(res, filePath) {
        // Vite emits content-hashed file names under /assets, so they never change once built.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image too large (max 5MB)"
        : err.code === "LIMIT_FILE_COUNT"
          ? "Too many images (max 8)"
          : err.message;
    return res.status(400).json({ message });
  }
  if (err.message?.includes("Only JPEG")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || "Server error" });
});

async function start() {
  await connectDb();
  await seedIfEmpty();
  if (configureCloudinary()) {
    console.log("Cloudinary configured");
  } else {
    console.warn("Cloudinary not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  }
  verifyMailer().then((status) => {
    console.log(`Mail (orders): ${status.orders}`);
    console.log(`Mail (customer): ${status.customer}`);
  });
  startCartReminders();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIZAZY running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
