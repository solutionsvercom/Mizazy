import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  products: [String],
  discount: Number,
  image: String,
  tag: String,
});

export default mongoose.model("Bundle", bundleSchema);
