import { useEffect, useState } from "react";
import { useStore } from "../store";
import { api, PlacedOrder } from "../api";
import { Product } from "../data";
import SignInGate from "../components/SignInGate";

interface AccountPageProps {
  onNavigate: (page: string) => void;
  onViewProduct: (product: Product) => void;
  onAuthOpen: () => void;
}

type Tab = "orders" | "wishlist" | "addresses" | "reviews";

export default function AccountPage({ onNavigate, onViewProduct, onAuthOpen }: AccountPageProps) {
  const { user, logout, products, wishlist, toggleWishlist } = useStore();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    api.myOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoadingOrders(false));
  }, [user]);

  if (!user) {
    return (
      <SignInGate
        title="Sign in to continue"
        description="Track orders, save gadgets, and manage delivery addresses."
        onAuthOpen={onAuthOpen}
        onNavigate={onNavigate}
      />
    );
  }

  const handleSignOut = () => {
    logout();
    onNavigate("home");
  };

  const saved = products.filter((p) => wishlist.includes(p.id));
  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "My Orders" },
    { id: "wishlist", label: "Wishlist" },
    { id: "addresses", label: "Addresses" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] py-10 pb-32 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="section-label mb-2">Account</p>
            <h1 className="section-heading text-4xl text-white">Hello, {user.name.split(" ")[0]}</h1>
            <p className="text-white/40 text-sm mt-2">{user.email} · {user.phone}</p>
          </div>
          <button onClick={handleSignOut} className="btn-outline py-2.5 px-5 text-sm">Sign out</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-display font-500 transition-all ${
                tab === t.id ? "bg-white text-[#050505]" : "border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-4">
            {loadingOrders && <p className="text-white/40">Loading orders...</p>}
            {!loadingOrders && orders.length === 0 && (
              <div className="bg-[#0e0e0e] border border-white/06 rounded-2xl p-10 text-center">
                <p className="font-display font-600 text-white/50 mb-2">No orders yet</p>
                <button className="btn-primary mt-3" onClick={() => onNavigate("home")}>Shop MIZAZY</button>
              </div>
            )}
            {orders.map((order) => (
              <div key={order.orderNumber} className="bg-[#0e0e0e] border border-white/06 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-display font-700 text-white">{order.orderNumber}</p>
                    <p className="text-white/35 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D4A520]/12 border border-[#D4A520]/25 text-[#D4A520] text-xs font-display font-700">
                    {order.currentStatusLabel}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.color}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-display font-600 truncate">{item.name}</p>
                        <p className="text-white/35 text-xs">{item.colorName} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-white text-sm font-display font-700">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white/50 text-sm">Total ₹{order.totals.total.toLocaleString()}</p>
                  <button className="text-[#D4A520] text-sm font-600" onClick={() => onNavigate("track")}>
                    Track shipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          saved.length === 0 ? (
            <p className="text-white/40">No saved gadgets yet. Tap the heart on a product to add it.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {saved.map((p) => (
                <button key={p.id} className="bg-[#0e0e0e] border border-white/06 rounded-xl overflow-hidden text-left" onClick={() => onViewProduct(p)}>
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                  <div className="p-3">
                    <p className="font-display font-600 text-white text-sm">{p.name}</p>
                    <p className="text-[#D4A520] text-xs mt-1">₹{p.price.toLocaleString()}</p>
                    <button
                      className="text-white/35 text-xs mt-2 hover:text-white"
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    >
                      Remove
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )
        )}

        {tab === "addresses" && (
          <div className="space-y-3">
            {user.addresses.length === 0 && <p className="text-white/40">No saved addresses. Add one at checkout.</p>}
            {user.addresses.map((a, i) => (
              <div key={i} className="bg-[#0e0e0e] border border-white/06 rounded-xl p-5">
                <p className="font-display font-700 text-white">{a.name} · {a.phone}</p>
                <p className="text-white/45 text-sm mt-1">{a.address}, {a.city}, {a.state} - {a.pincode}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <p className="text-white/40">Verified reviews from your purchases will appear here.</p>
        )}
      </div>
    </div>
  );
}
