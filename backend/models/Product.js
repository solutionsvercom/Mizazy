import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    badge: { type: String, enum: ["BEST SELLER", "NEW", "LIMITED", "SALE"] },
    colors: { type: [String], default: [] },
    colorNames: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    features: { type: [String], default: [] },
    specs: { type: Map, of: String, default: {} },
    inBox: { type: [String], default: [] },
    emi: { type: String },
    isNew: { type: Boolean, default: false },
    stock: { type: Number, default: 20 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.set("toJSON", {
  transform(_doc, ret) {
    if (ret.specs instanceof Map) ret.specs = Object.fromEntries(ret.specs);
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
