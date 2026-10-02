import { useState, useEffect } from "react";
import { api, PlacedOrder } from "../api";
import { useStore } from "../store";
import SignInGate from "../components/SignInGate";
import { optimizeImage } from "../media";

interface TrackingPageProps {
  onNavigate: (page: string) => void;
  onAuthOpen: () => void;
  prefillOrder?: string;
}

export default function TrackingPage({ onNavigate, onAuthOpen, prefillOrder }: TrackingPageProps) {
  const { user } = useStore();
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrder(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .myOrders()
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
        if (prefillOrder) setOrder(list.find((o) => o.orderNumber === prefillOrder) ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your orders");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, prefillOrder]);

  if (!user) {
    return (
      <SignInGate
        title="Sign in to track your order"
        description="Order status is available for orders placed from your MIZAZY account."
        onAuthOpen={onAuthOpen}
        onNavigate={onNavigate}
      />
    );
  }

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
          <p className="text-white/40">Live delivery status of your MIZAZY orders</p>
        </div>

        {!order ? (
          <div className="space-y-4 mb-8">
            {loading && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-8 flex items-center justify-center gap-2 text-white/50 text-sm">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                Fetching your orders...
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {!loading && !error && orders.length === 0 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-10 text-center">
                <p className="font-display font-600 text-white/60 mb-2">You haven't placed any orders yet</p>
                <p className="text-white/35 text-sm mb-6">Once you order, its live status will show up here.</p>
                <button className="btn-primary justify-center py-3 px-6" onClick={() => onNavigate("home")}>Shop MIZAZY</button>
              </div>
            )}
            {!loading && orders.map((o) => (
              <button
                key={o.orderNumber}
                onClick={() => setOrder(o)}
                className="w-full text-left bg-[#0e0e0e] rounded-2xl border border-white/07 hover:border-[#D4A520]/30 p-5 flex items-center gap-4 transition-colors"
              >
                <img
                  src={optimizeImage(o.items[0]?.image ?? "", 200)}
                  alt={o.items[0]?.name}
                  className="w-14 h-14 rounded-xl object-cover bg-[#111] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-700 text-white truncate">
                    {o.items[0]?.name}
                    {o.items.length > 1 && <span className="text-white/40 font-500"> +{o.items.length - 1} more</span>}
                  </p>
                  <p className="text-white/35 text-xs mt-1">
                    Order #{o.orderNumber} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4A520]/12 border border-[#D4A520]/25 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#D4A520] animate-pulse" />
                  <span className="font-display font-700 text-[#D4A520] text-xs">{o.currentStatusLabel}</span>
                </div>
              </button>
            ))}
          </div>
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
                  { label: "Tracking Number", value: order.trackingNumber || "Shared once shipped" },
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
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-[#D4A520] text-sm font-display font-600 hover:underline"
                >
                  Track on Delhivery
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
                </a>
              )}
            </div>

            {order.courierUpdates && order.courierUpdates.length > 0 && (
              <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-6">
                <h3 className="font-display font-700 text-white text-base mb-1">Shipment Updates</h3>
                <p className="text-white/30 text-xs mb-5">Live from {order.shippingPartner}</p>
                <div className="space-y-4">
                  {order.courierUpdates.map((u, i) => (
                    <div key={`${u.time}-${i}`} className="flex gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? "bg-[#D4A520]" : "bg-white/15"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className={`font-display font-600 text-sm ${i === 0 ? "text-white" : "text-white/60"}`}>{u.status}</p>
                          {u.time && <p className="text-white/25 text-xs flex-shrink-0">{u.time}</p>}
                        </div>
                        {(u.location || u.instructions) && (
                          <p className="text-white/35 text-xs mt-0.5">{[u.location, u.instructions].filter(Boolean).join(" · ")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setOrder(null)}
                className="btn-outline flex-1 justify-center py-3"
              >
                {orders.length > 1 ? "View All Orders" : "Back to My Orders"}
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
