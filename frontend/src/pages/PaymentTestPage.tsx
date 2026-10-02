import { useEffect, useState } from "react";
import { api } from "../api";
import { useStore } from "../store";
import { getAdminSessionToken, testPaymentCartItem } from "../testPayment";

interface PaymentTestPageProps {
  onNavigate: (page: string) => void;
}

export default function PaymentTestPage({ onNavigate }: PaymentTestPageProps) {
  const { setCart } = useStore();
  const [isAdmin] = useState(() => Boolean(getAdminSessionToken()));
  const [config, setConfig] = useState<{ cashfree: boolean; mode: string } | null>(null);

  useEffect(() => {
    api.paymentConfig().then(setConfig).catch(() => setConfig({ cashfree: false, mode: "sandbox" }));
  }, []);

  const start = () => {
    setCart([testPaymentCartItem()]);
    onNavigate("checkout");
  };

  return (
    <div className="min-h-[70vh] bg-[#050505] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#0e0e0e] rounded-2xl border border-white/5 p-8">
        <span className="section-label">Admin tool</span>
        <h1 className="font-display font-700 text-white text-2xl mt-2">₹1 Cashfree test payment</h1>

        {!isAdmin ? (
          <>
            <p className="text-white/45 text-sm mt-3">Sign in to the MIZAZY admin panel first, then open this page again.</p>
            <a href="/admin" className="btn-gold py-3 px-6 justify-center mt-6 inline-flex">Go to admin sign-in</a>
          </>
        ) : (
          <>
            <ul className="text-white/50 text-sm mt-4 space-y-2 list-disc pl-5">
              <li>Runs the real checkout with a ₹1 item and free shipping.</li>
              <li>
                Cashfree mode:{" "}
                <strong className="text-white">
                  {config ? (config.cashfree ? (config.mode === "production" ? "Live — ₹1 is actually charged" : "Sandbox — no real money") : "Not configured") : "Checking…"}
                </strong>
              </li>
              <li>Your current cart is replaced by the test item.</li>
              <li>The order appears in the admin panel as "Cashfree Test Payment" and is not counted in revenue.</li>
            </ul>
            <button
              onClick={start}
              disabled={!config?.cashfree}
              className="btn-gold py-3 px-6 justify-center mt-6 w-full disabled:opacity-50"
            >
              Start ₹1 test payment →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
