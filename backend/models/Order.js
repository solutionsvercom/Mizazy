import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    image: String,
    color: String,
    colorName: String,
    quantity: Number,
    price: Number,
    mrp: Number,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    id: String,
    label: String,
    desc: String,
    time: String,
    done: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phone: { type: String, required: true, index: true },
    email: String,
    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    items: { type: [orderItemSchema], required: true },
    delivery: { type: String, enum: ["standard", "express"], default: "standard" },
    payment: {
      method: { type: String, enum: ["upi", "card", "cod", "netbanking"], default: "upi" },
      status: { type: String, enum: ["pending", "confirmed", "failed"], default: "confirmed" },
      upiId: String,
    },
    coupon: String,
    totals: {
      subtotal: Number,
      discount: Number,
      couponDiscount: Number,
      shipping: Number,
      total: Number,
    },
    status: {
      type: String,
      enum: ["confirmed", "packed", "shipped", "transit", "out", "delivered", "cancelled"],
      default: "confirmed",
    },
    timeline: { type: [timelineSchema], default: [] },
    trackingNumber: String,
    shippingPartner: { type: String, default: "BlueDart Express" },
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
