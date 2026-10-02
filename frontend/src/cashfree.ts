type CashfreeMode = "sandbox" | "production";

interface CashfreeInstance {
  checkout(options: { paymentSessionId: string; redirectTarget?: "_modal" | "_self" }): Promise<{
    error?: { message?: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage?: string };
  }>;
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: CashfreeMode }) => CashfreeInstance;
  }
}

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";
const PENDING_KEY = "mizazy_pending_payment";

let sdk: Promise<NonNullable<Window["Cashfree"]>> | null = null;

function loadSdk() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  sdk ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => (window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Payment service unavailable")));
    script.onerror = () => {
      sdk = null;
      reject(new Error("Could not load the payment page. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return sdk;
}

/** Opens the Cashfree payment popup; resolves when it closes (paid, failed or dismissed). */
export async function openCashfreeCheckout(paymentSessionId: string, mode: CashfreeMode) {
  const Cashfree = await loadSdk();
  return Cashfree({ mode }).checkout({ paymentSessionId, redirectTarget: "_modal" });
}

export interface PendingPayment {
  orderNumber: string;
  token: string;
}

export function savePendingPayment(p: PendingPayment) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
}

export function readPendingPayment(): PendingPayment | null {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  sessionStorage.removeItem(PENDING_KEY);
}
