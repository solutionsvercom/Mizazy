import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";
import Bundle from "../models/Bundle.js";

const router = Router();

function serializeProduct(doc) {
  const json = doc.toJSON();
  if (json.specs && typeof json.specs === "object" && !(json.specs instanceof Array)) {
    json.specs = Object.fromEntries(
      Object.entries(json.specs).filter(([, v]) => v != null)
    );
  }
  return json;
}

router.get("/", async (req, res) => {
  try {
    const { category, q, badge, isNew } = req.query;
    const filter = {};

    if (category && category !== "All") {
      if (category === "New Arrivals") filter.$or = [{ isNew: true }, { badge: "NEW" }];
      else filter.category = category;
    }
    if (badge) filter.badge = badge;
    if (isNew === "true") filter.$or = [{ isNew: true }, { badge: "NEW" }];
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: rx },
        { tagline: rx },
        { category: rx },
        { description: rx },
        { features: rx },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: 1 });
    res.json(products.map(serializeProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const products = await Product.find({
      $or: [{ name: rx }, { tagline: rx }, { category: rx }, { description: rx }, { features: rx }],
    }).limit(12);
    res.json(products.map(serializeProduct));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(serializeProduct(product));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export async function catalogPayload() {
  const [products, categories, reviews, bundles] = await Promise.all([
    Product.find().sort({ createdAt: 1 }),
    Category.find(),
    Review.find().sort({ createdAt: 1 }),
    Bundle.find(),
  ]);
  return {
    products: products.map(serializeProduct),
    categories,
    reviews,
    bundles,
  };
}

export default router;
