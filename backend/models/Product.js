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
    title: { type: String },
    slug: { type: String, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    faqs: { type: [{ q: String, a: String, _id: false }], default: undefined },
    warranty: { type: String },
    tags: { type: [String], default: undefined },
    seoKeywords: { type: [String], default: undefined },
    ogTitle: { type: String },
    ogDescription: { type: String },
    imageAlt: { type: String },
    imageTitle: { type: String },
    colorImages: { type: [[String]], default: undefined },
    infoSections: {
      type: [
        {
          title: String,
          items: [{ label: String, value: String, _id: false }],
          notes: { type: [String], default: undefined },
          _id: false,
        },
      ],
      default: undefined,
    },
    keyFeatures: {
      type: [{ title: String, text: String, points: { type: [String], default: undefined }, _id: false }],
      default: undefined,
    },
    image: { type: String, required: true },
    video: { type: String },
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
