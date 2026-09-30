import { CartItem } from "../data";

interface CartSidebarProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, color: string, qty: number) => void;
  onRemove: (productId: string, color: string) => void;
  onCheckout: () => void;
  onViewProduct: (product: CartItem["product"]) => void;
}

export default function CartSidebar({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onCheckout,
  onViewProduct,
}: CartSidebarProps) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const mrpTotal = items.reduce((s, i) => s + i.product.mrp * i.quantity, 0);
  const savings = mrpTotal - subtotal;
  const shipping = subtotal >= 999 ? 0 : 99;
  const freeShippingThreshold = 999;
  const remaining = freeShippingThreshold - subtotal;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0e0e0e] border-l border-white/07 animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/06">
          <div>
            <h2 className="font-display font-700 text-lg text-white">Your Cart</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {items.length === 0
                ? "No items yet"
                : `${items.reduce((s, i) => s + i.quantity, 0)} item${items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/06 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-[#111] border-b border-white/04">
            {remaining > 0 ? (
              <>
                <p className="text-xs text-white/50 mb-1.5">
                  Add <span className="text-[#D4A520] font-600">₹{remaining}</span> more for <span className="text-white/80">FREE DELIVERY</span>
                </p>
                <div className="h-1 bg-white/06 rounded-full overflow-hidden">
                  <div
                    className="h-full progress-bar rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-[#5DD87A] font-display font-600 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                You've unlocked FREE DELIVERY!
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/04 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <p className="font-display font-600 text-white/40 mb-1">Your cart is empty</p>
              <p className="text-white/25 text-xs">Add some MIZAZY gadgets to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.color}`}
                className="flex gap-4 p-3 rounded-xl bg-white/03 border border-white/05 hover:border-white/09 transition-all"
              >
                {/* Image */}
                <button
                  onClick={() => { onViewProduct(item.product); onClose(); }}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-[#111] flex-shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-600 text-white text-sm leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-white/35 text-xs mt-0.5">{item.colorName}</p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id, item.color)}
                      className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          item.quantity > 1
                            ? onUpdateQty(item.product.id, item.color, item.quantity - 1)
                            : onRemove(item.product.id, item.color)
                        }
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-display font-600 text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          onUpdateQty(item.product.id, item.color, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-display font-700 text-white text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-white/30 text-xs">
                          ₹{item.product.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Complete your setup */}
          {items.length > 0 && (
            <div className="mt-2 pt-2">
              <p className="text-[10px] font-display font-600 tracking-widest uppercase text-white/30 mb-3">
                Complete Your Setup
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[0, 1].map((i) => {
                  const rec = [
                    { name: "Mizazy 135W Super Fast Charger", price: 899, image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=200&h=200&fit=crop&auto=format" },
                    { name: "Mizazy 20W USB-C Power Adapter", price: 899, image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=200&h=200&fit=crop&auto=format" },
                  ][i];
                  return (
                    <div key={i} className="flex-shrink-0 w-32 rounded-lg bg-white/03 border border-white/05 p-2">
                      <img src={rec.image} alt={rec.name} className="w-full h-16 object-cover rounded mb-1.5" />
                      <p className="text-white text-[10px] font-display font-600 leading-tight mb-1">{rec.name}</p>
                      <p className="text-[#D4A520] text-[10px] font-600">₹{rec.price.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/06 px-6 py-5 space-y-3">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/50">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-[#5DD87A]">
                  <span>You Save</span>
                  <span>−₹{savings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white/50">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-[#5DD87A]">FREE</span> : `₹${shipping}`}</span>
              </div>
              <hr className="border-white/06" />
              <div className="flex justify-between font-display font-700 text-white text-base">
                <span>Total</span>
                <span>₹{(subtotal + shipping).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => { onCheckout(); onClose(); }}
              className="btn-primary w-full justify-center py-3.5 text-sm"
            >
              Proceed to Checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {["Secure Pay", "Easy Returns", "Genuine"].map((t) => (
                <span key={t} className="text-[9px] font-display font-500 text-white/25 tracking-wide">
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
