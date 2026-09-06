import { useState, useEffect } from "react";
import { api, PlacedOrder } from "../api";

interface TrackingPageProps {
  onNavigate: (page: string) => void;
  prefillOrder?: string;
}

export default function TrackingPage({ onNavigate, prefillOrder }: TrackingPageProps) {
  const [orderId, setOrderId] = useState(prefillOrder || "");
  const [mobile, setMobile] = useState("");
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prefillOrder) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await api.trackOrder(prefillOrder);
        if (!cancelled) setOrder(result);
      } catch {
        /* show the form if the saved order is not in this database yet */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefillOrder]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.trackOrder(orderId, mobile || undefined);
      setOrder(result);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const deliveryDate = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Home
        </button>

        <div className="text-center mb-12">
          <p className="section-label mb-3">Real-time</p>
          <h1 className="section-heading text-4xl sm:text-5xl text-white mb-3">Track My Order</h1>
          <p className="text-white/40">Enter your order details to see live delivery status</p>
        </div>

        {!order ? (
          <form
            onSubmit={handleTrack}
            className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-8 mb-8"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Order ID</label>
                <input
                  className="input-dark"
                  placeholder="MZ-XXXXXXXX"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-display font-600 mb-1.5 tracking-wide uppercase">Mobile Number</label>
                <input
                  className="input-dark"
                  placeholder="Registered mobile number"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !orderId}
                className="btn-primary w-full justify-center py-3.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>
                    Fetching status...
                  </span>
                ) : "Track Order"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <img
                    src={order.items[0]?.image}
                    alt={order.items[0]?.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#111]"
                  />
                  <div>
                    <p className="font-display font-700 text-white">{order.items[0]?.name}</p>
                    <p className="text-white/40 text-sm">{order.items[0]?.colorName} · Qty {order.items[0]?.quantity}</p>
                    <p className="text-white/25 text-xs mt-1">Order #{order.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4A520]/12 border border-[#D4A520]/25">
                    <span className="w-2 h-2 rounded-full bg-[#D4A520] animate-pulse" />
                    <span className="font-display font-700 text-[#D4A520] text-sm">{order.currentStatusLabel}</span>
                  </div>
                  <p className="text-white/35 text-xs mt-2">Expected: {deliveryDate}</p>
                </div>
              </div>

              <div className="mb-8 p-4 rounded-xl bg-[#D4A520]/08 border border-[#D4A520]/20">
                <p className="font-display font-600 text-[#D4A520] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4A520] animate-pulse flex-shrink-0" />
                  {order.currentStatusLabel.toUpperCase()} — {order.currentStatusDesc}
                </p>
                <p className="text-white/45 text-xs mt-1">
                  Expected delivery: {deliveryDate}. Shipping partner: {order.shippingPartner}
                </p>
              </div>

              <div className="space-y-0">
                {order.timeline.map((status, i) => (
                  <div key={status.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`tracking-dot ${status.done ? "done" : status.active ? "active" : "pending"}`}>
                        {status.done && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#050505">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        )}
                        {status.active && (
                          <div className="w-2 h-2 rounded-full bg-white/80" />
                        )}
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div
                          className="tracking-line w-0.5 flex-1 my-1"
                          style={{
                            background: status.done ? "#D4A520" : "rgba(255,255,255,0.08)",
                            minHeight: "40px",
                          }}
                        />
                      )}
                    </div>
                    <div className={`pb-6 flex-1 ${i === order.timeline.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-display font-700 text-sm ${status.done ? "text-white" : status.active ? "text-white" : "text-white/30"}`}>
                          {status.label}
                        </p>
                        {status.time !== "—" && (
                          <p className="text-white/25 text-xs flex-shrink-0">{status.time}</p>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${status.done ? "text-white/45" : status.active ? "text-white/60" : "text-white/20"}`}>
                        {status.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-6">
              <h3 className="font-display font-700 text-white text-base mb-5">Delivery Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Tracking Number", value: order.trackingNumber },
                  { label: "Shipping Partner", value: order.shippingPartner },
                  { label: "Delivery Address", value: `${order.address.city}, ${order.address.pincode}` },
                  { label: "Payment", value: `${order.payment.status === "confirmed" ? "Paid" : "COD"} · ₹${order.totals.total.toLocaleString()}` },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-white/35 text-xs font-display font-500 mb-1">{d.label}</p>
                    <p className="text-white/80 font-display font-600">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setOrder(null)}
                className="btn-outline flex-1 justify-center py-3"
              >
                Track Another Order
              </button>
              <button
                onClick={() => onNavigate("home")}
                className="btn-primary flex-1 justify-center py-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
