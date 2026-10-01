import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
  // Personal coupons (abandoned-cart offers) can only be redeemed by this account.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
});

export default mongoose.model("Coupon", couponSchema);
