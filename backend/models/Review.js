import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: String,
    product: String,
    productId: { type: String, index: true },
    review: { type: String, required: true },
    verified: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    avatar: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
