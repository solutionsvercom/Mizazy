import mongoose from "mongoose";

const warrantyClaimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    invoiceUrl: { type: String, required: true },
    invoicePublicId: { type: String, default: "" },
    status: { type: String, enum: ["submitted", "reviewing", "resolved"], default: "submitted" },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

warrantyClaimSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("WarrantyClaim", warrantyClaimSchema);
