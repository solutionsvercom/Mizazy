import { useEffect, useRef, useState } from "react";
import { api, PlacedOrder } from "../api";
import { clearPendingPayment, readPendingPayment } from "../cashfree";

interface PaymentStatusPageProps {
  onOrderPlaced: (order: PlacedOrder) => void;
  onNavigate: (page: string) => void;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function PaymentStatusPage({ onOrderPlaced, onNavigate }: PaymentStatusPageProps) {
  const [state, setState] = useState<"checking" | "pending" | "failed">("checking");
  const [message, setMessage] = useState("");
  const onPlaced = useRef(onOrderPlaced);
  onPlaced.current = onOrderPlaced;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = readPendingPayment();
    const orderNumber = params.get("order") || saved?.orderNumber || "";
    const token = params.get("t") || saved?.token || "";
    if (!orderNumber) {
      setState("failed");
      setMessage("We couldn't find a payment to check.");
      return;
    }

    let cancelled = false;
    (async () => {
      // Bank confirmation can take a few seconds after the customer returns.
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        try {
          const result = await api.verifyPayment(orderNumber, token);
          if (result.paymentStatus === "confirmed") {
            clearPendingPayment();
            if (!cancelled) onPlaced.current(result.order);
            return;
          }
          if (result.paymentStatus === "failed") break;
        } catch (err) {
          if (attempt === 4 && !cancelled) {
            setState("failed");
            setMessage(err instanceof Error ? err.message : "Could not check the payment.");
            return;
          }
        }
        await wait(3000);
      }
      if (!cancelled) setState("pending");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[70vh] bg-[#050505] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#0e0e0e] rounded-2xl border border-white/5 p-8 text-center">
        {state === "checking" ? (
          <>
            <svg className="animate-spin mx-auto text-[#D4A520]" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <h1 className="font-display font-700 text-white text-xl mt-5">Confirming your payment…</h1>
            <p className="text-white/45 text-sm mt-2">Please don't close this page.</p>
          </>
        ) : (
          <>
            <h1 className="font-display font-700 text-white text-xl">
              {state === "pending" ? "Payment not confirmed yet" : "Payment not completed"}
            </h1>
            <p className="text-white/45 text-sm mt-3">
              {message ||
                "If money was debited from your account, your order will be confirmed automatically once the bank confirms it and you'll receive an email. Otherwise, you can try again."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button onClick={() => onNavigate("checkout")} className="btn-gold py-3 px-6 justify-center">Try again</button>
              <button onClick={() => onNavigate("home")} className="btn-outline py-3 px-6">Back to Home</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
