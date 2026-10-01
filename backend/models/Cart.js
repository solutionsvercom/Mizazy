import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    color: String,
    colorName: String,
  },
  { _id: false }
);

/** Server copy of a signed-in customer's cart, used for abandoned-cart reminder emails. */
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    itemsUpdatedAt: { type: Date, default: Date.now },
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
