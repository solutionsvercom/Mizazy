import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
});

export default mongoose.model("Coupon", couponSchema);
