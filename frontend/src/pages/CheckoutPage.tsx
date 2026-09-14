import { useState } from "react";
import { CartItem } from "../data";
import { MIZAZY_LOGO_URL } from "../brand";
import { api, PlacedOrder } from "../api";
import { useStore } from "../store";

interface CheckoutPageProps {
  cart: CartItem[];
  onOrderPlaced: (order: PlacedOrder) => void;
  onNavigate: (page: string) => void;
}

const steps = [
  { num: 1, label: "Delivery" },
  { num: 2, label: "Shipping" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Review" },
];

export default function CheckoutPage({ cart, onOrderPlaced, onNavigate }: CheckoutPageProps) {
  const { user } = useStore();
  const defaultAddress = user?.addresses?.[0];
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    name: defaultAddress?.name || user?.name || "",
    phone: defaultAddress?.phone || user?.phone || "",
    address: defaultAddress?.address || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    pincode: defaultAddress?.pincode || "",
  });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"upi" | "card" | "cod" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponPercent, setCouponPercent] = useState(10);
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const mrpTotal = cart.reduce((s, i) => s + i.product.mrp * i.quantity, 0);
  const savings = mrpTotal - subtotal;
  const couponDiscount = couponApplied ? Math.round(subtotal * (couponPercent / 100)) : 0;
  const shipping = delivery === "express" ? 149 : subtotal >= 999 ? 0 : 99;
  const total = subtotal - couponDiscount + shipping;

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const data = await api.validateCoupon(coupon);
      setCouponPercent(data.discountPercent);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    setError("");
    try {
      const order = await api.placeOrder({
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          color: item.color,
          colorName: item.colorName,
        })),
        address,
        delivery,
        payment: { method: payment, upiId: payment === "upi" ? upiId : undefined },
        coupon: couponApplied ? coupon : undefined,
      });
      onOrderPlaced(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
      setPlacing(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return address.name && address.phone && address.address && address.city && address.state && address.pincode;
    if (step === 3 && payment === "upi") return upiId.includes("@");
    return true;
  };

  const deliveryDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-[#050505] py-10 pb-32 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2">
            <img
              src={MIZAZY_LOGO_URL}
              alt="MIZAZY"
              style={{
                height: 48,
                objectFit: "contain",
                filter: "invert(1) hue-rotate(180deg) drop-shadow(0 0 8px rgba(212,165,32,0.4))",
              }}
            />
          </button>
          <div className="flex items-center gap-1 text-[#5DD87A] text-xs font-display font-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure Checkout
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center mb-12">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`step-dot ${step > s.num ? "done" : step === s.num ? "active" : "inactive"}`}>
                  {step > s.num ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  ) : s.num}
                </div>
                <span className={`text-[10px] font-display font-600 mt-1.5 tracking-wide ${step === s.num ? "text-white" : "text-white/30"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-line mx-2 mb-4 ${step > s.num ? "done" : "inactive"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-6 sm:p-8">
                <h2 className="font-display font-700 text-white text-xl mb-6">Delivery Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Full Name</label>
                    <input
                      className="input-dark"
                      placeholder="Arjun Sharma"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Phone Number</label>
                    <input
                      className="input-dark"
                      placeholder="10-digit mobile number"
                      value={address.phone}
                      maxLength={10}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/, "") })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Address</label>
                    <textarea
                      className="input-dark resize-none"
                      rows={2}
                      placeholder="House/Flat No., Street, Locality"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">City</label>
                    <input
                      className="input-dark"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">State</label>
                    <select className="input-dark" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                      <option value="">Select state</option>
                      {["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana", "Gujarat", "Rajasthan", "West Bengal", "UP", "MP"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">PIN Code</label>
                    <input
                      className="input-dark"
                      placeholder="6-digit PIN"
                      value={address.pincode}
                      maxLength={6}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/, "") })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Delivery method */}
            {step === 2 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-6 sm:p-8">
                <h2 className="font-display font-700 text-white text-xl mb-6">Delivery Method</h2>
                <div className="space-y-3">
                  <label
                    className={`radio-pill flex items-center gap-4 cursor-pointer ${delivery === "standard" ? "selected" : ""}`}
                    onClick={() => setDelivery("standard")}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${delivery === "standard" ? "border-[#D4A520]" : "border-white/20"}`}>
                      {delivery === "standard" && <div className="w-2 h-2 rounded-full bg-[#D4A520]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-600 text-white text-sm">Standard Delivery</p>
                      <p className="text-white/40 text-xs mt-0.5">Delivered by {deliveryDate(4)}</p>
                    </div>
                    <p className="font-display font-700 text-white text-sm">
                      {subtotal >= 999 ? <span className="text-[#5DD87A]">FREE</span> : "₹99"}
                    </p>
                  </label>
                  <label
                    className={`radio-pill flex items-center gap-4 cursor-pointer ${delivery === "express" ? "selected" : ""}`}
                    onClick={() => setDelivery("express")}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${delivery === "express" ? "border-[#D4A520]" : "border-white/20"}`}>
                      {delivery === "express" && <div className="w-2 h-2 rounded-full bg-[#D4A520]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-600 text-white text-sm">Express Delivery</p>
                        <span className="badge badge-new">Fast</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">Delivered by {deliveryDate(1)} · Order in next 2h</p>
                    </div>
                    <p className="font-display font-700 text-white text-sm">₹149</p>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-6 sm:p-8">
                <h2 className="font-display font-700 text-white text-xl mb-6">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { id: "upi", label: "UPI", icon: "⚡" },
                    { id: "card", label: "Card", icon: "💳" },
                    { id: "netbanking", label: "Net Banking", icon: "🏦" },
                    { id: "cod", label: "Cash on Delivery", icon: "💵" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPayment(p.id as typeof payment)}
                      className={`radio-pill flex items-center gap-3 ${payment === p.id ? "selected" : ""}`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="font-display font-500 text-white text-sm">{p.label}</span>
                    </button>
                  ))}
                </div>

                {payment === "upi" && (
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">UPI ID</label>
                    <input
                      className="input-dark"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-white/25 text-xs mt-2">Examples: name@okicici, name@ybl, name@paytm</p>
                    <div className="flex gap-3 mt-4">
                      {["G Pay", "PhonePe", "Paytm", "BHIM"].map((w) => (
                        <button key={w} className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs font-display font-600 hover:border-white/25 hover:text-white/75 transition-all">
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {payment === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Card Number</label>
                      <input className="input-dark" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Expiry</label>
                        <input className="input-dark" placeholder="MM / YY" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">CVV</label>
                        <input className="input-dark" placeholder="•••" maxLength={4} type="password" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Name on Card</label>
                      <input className="input-dark" placeholder="As printed on card" />
                    </div>
                  </div>
                )}

                {payment === "netbanking" && (
                  <div>
                    <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Select Bank</label>
                    <select className="input-dark">
                      <option>Select your bank</option>
                      {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "Bank of Baroda", "Other"].map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {payment === "cod" && (
                  <div className="p-4 rounded-xl bg-[#5DD87A]/08 border border-[#5DD87A]/20">
                    <p className="text-[#5DD87A] font-display font-600 text-sm">Cash on Delivery available for your location.</p>
                    <p className="text-white/40 text-xs mt-1">Pay when your order arrives. No extra charges.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-6 sm:p-8">
                <h2 className="font-display font-700 text-white text-xl mb-6">Order Review</h2>

                {/* Address summary */}
                <div className="mb-6 p-4 rounded-xl bg-white/03 border border-white/05">
                  <div className="flex items-center justify-between mb-2">
                    <span className="section-label">Delivery To</span>
                    <button onClick={() => setStep(1)} className="text-[#D4A520] text-xs font-600 hover:underline">Edit</button>
                  </div>
                  <p className="font-display font-600 text-white text-sm">{address.name} · {address.phone}</p>
                  <p className="text-white/45 text-xs mt-0.5">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-white/03 border border-white/05">
                  <div className="flex items-center justify-between mb-2">
                    <span className="section-label">Payment</span>
                    <button onClick={() => setStep(3)} className="text-[#D4A520] text-xs font-600 hover:underline">Edit</button>
                  </div>
                  <p className="font-display font-600 text-white text-sm capitalize">
                    {payment === "upi" ? `UPI: ${upiId || "Not entered"}` : payment === "card" ? "Credit / Debit Card" : payment === "cod" ? "Cash on Delivery" : "Net Banking"}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.color}`} className="flex items-center gap-4 py-3 border-b border-white/04 last:border-0">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover bg-[#111] flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-display font-600 text-white text-sm">{item.product.name}</p>
                        <p className="text-white/35 text-xs">{item.colorName} · Qty {item.quantity}</p>
                      </div>
                      <p className="font-display font-700 text-white text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn-outline py-3 px-6"
                >
                  ← Back
                </button>
              ) : (
                <button onClick={() => onNavigate("home")} className="btn-outline py-3 px-6">← Back to Cart</button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  className={`btn-primary py-3 px-8 ${!canProceed() ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!canProceed()}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="btn-gold py-3.5 px-8 min-w-[180px] justify-center"
                >
                  {placing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/>
                      </svg>
                      Placing Order...
                    </span>
                  ) : "Place Order →"}
                </button>
              )}
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="bg-[#0e0e0e] rounded-2xl border border-white/06 p-6 sticky top-24">
              <h3 className="font-display font-700 text-white text-base mb-5">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.color}`} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover bg-[#111]" />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-[#050505] text-[9px] font-700 rounded-full flex items-center justify-center font-display">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-600 text-white text-xs leading-tight truncate">{item.product.name}</p>
                      <p className="text-white/35 text-[10px]">{item.colorName}</p>
                    </div>
                    <p className="font-display font-700 text-white text-sm flex-shrink-0">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <hr className="border-white/06 mb-4" />

              {/* Coupon */}
              <div className="flex gap-2 mb-5">
                <input
                  className="input-dark flex-1 text-sm py-2"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={couponApplied}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className="px-3 rounded-lg border border-white/12 text-white/60 text-sm font-display font-600 hover:border-white/25 hover:text-white transition-all disabled:opacity-50"
                >
                  {couponApplied ? "✓" : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mb-3 -mt-3">{couponError}</p>}
              {couponApplied && (
                <p className="text-[#5DD87A] text-xs font-600 mb-4 -mt-3">{coupon} applied — {couponPercent}% off!</p>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/45">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-[#5DD87A]">
                    <span>Discount</span>
                    <span>−₹{savings.toLocaleString()}</span>
                  </div>
                )}
                {couponApplied && (
                  <div className="flex justify-between text-[#5DD87A]">
                    <span>Coupon ({coupon})</span>
                    <span>−₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/45">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-[#5DD87A]">FREE</span> : `₹${shipping}`}</span>
                </div>
                <hr className="border-white/06" />
                <div className="flex justify-between font-display font-700 text-white text-base pt-1">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <p className="text-white/25 text-[10px]">Inclusive of all taxes</p>
              </div>

              {/* Trust */}
              <div className="mt-5 pt-5 border-t border-white/05 space-y-2">
                {["Secure 256-bit SSL payment", "7-day hassle-free returns", "100% genuine MIZAZY products"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-white/30 text-xs">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
