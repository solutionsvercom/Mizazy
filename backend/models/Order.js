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
      gateway: String,
      cfOrderId: String,
      cfPaymentId: String,
      paymentGroup: String,
      paidAt: Date,
      // Lets a guest who started an online payment check its result without an account.
      accessToken: { type: String, select: false },
    },
    // True once stock, cart, coupon and emails have been processed (immediately for COD, after payment for online).
    finalized: { type: Boolean, default: false },
    // Test orders (e.g. the ₹1 Cashfree check) are excluded from revenue.
    isTest: { type: Boolean, default: false },
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
    // When set, tracking shows the admin-chosen status instead of the automatic time-based progress.
    statusSetByAdmin: { type: Boolean, default: false },
    statusUpdatedAt: Date,
    timeline: { type: [timelineSchema], default: [] },
    trackingNumber: String,
    shippingPartner: { type: String, default: "Delhivery" },
    // Why automatic Delhivery shipment creation failed (cleared once a shipment exists).
    shipmentError: String,
    // Latest live tracking from Delhivery for trackingNumber (AWB).
    courier: {
      awb: String,
      status: String,
      statusType: String,
      location: String,
      instructions: String,
      statusAt: Date,
      expectedDelivery: Date,
      scans: { type: [{ status: String, location: String, instructions: String, time: Date, _id: false }], default: undefined },
      fetchedAt: Date,
      error: String,
    },
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
