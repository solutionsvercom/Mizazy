import { PlacedOrder } from "../api";

interface ConfirmationPageProps {
  order: PlacedOrder;
  onNavigate: (page: string) => void;
  onTrack: () => void;
}

export default function ConfirmationPage({
  order,
  onNavigate,
  onTrack,
}: ConfirmationPageProps) {
  const deliveryDate = () => {
    const d = order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date();
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center py-12 pb-32 md:pb-12 px-4">
      <div className="max-w-lg w-full">
        <div className="relative flex justify-center mb-10 h-48">
          <div className="absolute w-64 h-64 rounded-full bg-[#D4A520]/10 blur-[60px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-40 h-40 rounded-full bg-white/05 blur-[40px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-44 h-44 rounded-full border border-[#D4A520]/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: "12s" }} />
          <div className="absolute w-32 h-32 rounded-full border border-white/06 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />

          {order.items[0] && (
            <div className="relative z-10 animate-float">
              <div className="absolute -inset-4 rounded-3xl bg-[#D4A520]/12 blur-2xl" />
              <img
                src={order.items[0].image}
                alt={order.items[0].name}
                className="w-36 h-36 object-cover rounded-2xl shadow-2xl"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(212,165,32,0.15)" }}
              />
            </div>
          )}

          <div className="absolute bottom-4 right-1/3 z-20 w-9 h-9 bg-[#5DD87A] rounded-full flex items-center justify-center shadow-lg animate-scale-in" style={{ animationDelay: "0.5s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        </div>

        <div className="bg-[#0e0e0e] rounded-2xl border border-white/07 p-8 text-center">
          <h1 className="section-heading text-3xl sm:text-4xl text-white mb-3">You're All Set.</h1>
          <p className="text-white/50 text-base mb-8 leading-relaxed">
            Your MIZAZY order has been confirmed. Get ready for premium tech.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/03 border border-white/05">
              <p className="text-white/35 text-[10px] font-display font-600 tracking-wider uppercase mb-1">Order</p>
              <p className="font-display font-700 text-white text-sm">{order.orderNumber}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/03 border border-white/05">
              <p className="text-white/35 text-[10px] font-display font-600 tracking-wider uppercase mb-1">Total</p>
              <p className="font-display font-700 text-white text-sm">₹{order.totals.total.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/03 border border-white/05">
              <p className="text-white/35 text-[10px] font-display font-600 tracking-wider uppercase mb-1">Payment</p>
              <p className="font-display font-700 text-[#5DD87A] text-sm">
                {order.payment.status === "confirmed" ? "Confirmed" : "COD"}
              </p>
            </div>
          </div>

          <div className="mb-8 p-4 rounded-xl bg-[#D4A520]/08 border border-[#D4A520]/20">
            <p className="text-white/50 text-xs mb-1">Estimated Delivery</p>
            <p className="font-display font-700 text-[#D4A520] text-lg">{deliveryDate()}</p>
            <p className="text-white/35 text-xs mt-1">{order.shippingPartner} · Track with ID: {order.orderNumber}</p>
          </div>

          <div className="space-y-3 mb-8 text-left">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/03">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-display font-600 text-white text-sm">{item.name}</p>
                  <p className="text-white/35 text-xs">{item.colorName} · Qty {item.quantity}</p>
                </div>
                <p className="font-display font-700 text-white text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={onTrack} className="btn-gold justify-center py-3.5 w-full">
              Track My Order
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button onClick={() => onNavigate("home")} className="btn-outline justify-center py-3.5 w-full">
              Continue Shopping
            </button>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          A confirmation email has been sent to your registered address. For support, contact MIZAZY at support@mizazy.com
        </p>
      </div>
    </div>
  );
}
