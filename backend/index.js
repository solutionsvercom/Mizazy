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
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";
import warrantyRoutes from "./routes/warranty.js";
import { isCashfreeConfigured, cashfreeMode } from "./cashfree.js";
import { isDelhiveryConfigured, delhiveryMode } from "./delhivery.js";
import { startShipmentTracking } from "./routes/orders.js";
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
app.use(
  express.json({
    verify(req, _res, buf) {
      // Cashfree webhook signatures are computed over the exact raw body.
      if (req.originalUrl.startsWith("/api/payments/cashfree/webhook")) req.rawBody = buf;
    },
  })
);

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
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/warranty", warrantyRoutes);
app.use("/api", catalogRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// The mark from the Cloudinary header logo. Local icon files are Git LFS
// pointers on the host, so the tab icon is served from this image instead.
const TAB_ICON_URL =
  "https://res.cloudinary.com/aiwtovua/image/upload/c_crop,x_421,y_22,w_780,h_780/c_fill,w_64,h_64,f_png/v1789379952/Mizazy_Logo.png";
const APPLE_TOUCH_ICON_URL =
  "https://res.cloudinary.com/aiwtovua/image/upload/c_crop,x_421,y_22,w_780,h_780/c_fill,w_180,h_180,f_png/v1789379952/Mizazy_Logo.png";
const iconBytes = new Map();

async function sendTabIcon(res, url) {
  let bytes = iconBytes.get(url);
  if (!bytes) {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(502).end();
      return;
    }
    bytes = Buffer.from(await upstream.arrayBuffer());
    iconBytes.set(url, bytes);
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.end(bytes);
}

app.get(["/favicon.ico", "/favicon.png"], (_req, res, next) => {
  sendTabIcon(res, TAB_ICON_URL).catch(next);
});
app.get(["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png"], (_req, res, next) => {
  sendTabIcon(res, APPLE_TOUCH_ICON_URL).catch(next);
});

// Google Search Console HTML file. Must stay at the site root.
const googleVerificationFile = path.join(__dirname, "../frontend/public/google5641f5728caab98f.html");
app.get("/google5641f5728caab98f.html", (_req, res) => {
  res.type("html");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(googleVerificationFile);
});

// Serve SEO files before the React fallback. Otherwise /sitemap.xml and
// /robots.txt are rewritten to index.html.
const publicSourceDir = path.join(__dirname, "../frontend/public");
app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(publicSourceDir, "sitemap.xml"));
});
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.sendFile(path.join(publicSourceDir, "robots.txt"));
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
        ? "File too large (max 5MB)"
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
    console.log(`Mail (payment): ${status.payment}`);
  });
  console.log(
    isCashfreeConfigured()
      ? `Cashfree configured (${cashfreeMode()})`
      : "Cashfree not configured — set CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV"
  );
  console.log(
    isDelhiveryConfigured()
      ? `Delhivery configured (${delhiveryMode()})`
      : "Delhivery not configured — set DELHIVERY_API_TOKEN and DELHIVERY_PICKUP_LOCATION"
  );
  startCartReminders();
  startShipmentTracking();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIZAZY running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
