import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import catalogRoutes from "./routes/catalog.js";
import { getAllowedOrigins, getAppUrl } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT || 5000);
const publicDir = path.join(__dirname, "public");
const allowedOrigins = getAllowedOrigins();

app.set("trust proxy", 1);

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
app.use("/api", catalogRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function start() {
  await connectDb();
  await seedIfEmpty();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MIZAZY running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start API:", err);
  process.exit(1);
});
