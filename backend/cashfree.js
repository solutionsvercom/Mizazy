import crypto from "crypto";

const API_VERSION = "2023-08-01";

function settings() {
  const appId = (process.env.CASHFREE_APP_ID || "").trim();
  const secret = (process.env.CASHFREE_SECRET_KEY || "").trim();
  const mode = (process.env.CASHFREE_ENV || "sandbox").trim().toLowerCase() === "production" ? "production" : "sandbox";
  return {
    appId,
    secret,
    mode,
    baseUrl: mode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
  };
}

export function isCashfreeConfigured() {
  const { appId, secret } = settings();
  return Boolean(appId && secret);
}

export function cashfreeMode() {
  return settings().mode;
}

async function call(method, path, body) {
  const { appId, secret, baseUrl } = settings();
  if (!appId || !secret) throw new Error("Cashfree is not configured");
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": appId,
      "x-client-secret": secret,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Cashfree request failed (${res.status})`);
  return data;
}

const CHECKOUT_METHODS = { upi: "upi", card: "cc,dc", netbanking: "nb" };

/** Creates a Cashfree order and returns { cfOrderId, paymentSessionId }. */
export async function createCashfreeOrder({ order, customerId, returnUrl, notifyUrl }) {
  const data = await call("POST", "/orders", {
    order_id: order.orderNumber,
    order_amount: Number(order.totals.total.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: customerId,
      customer_name: order.address.name,
      customer_phone: String(order.address.phone).replace(/\D/g, "").slice(-10),
      ...(order.email ? { customer_email: order.email } : {}),
    },
    order_meta: {
      return_url: returnUrl,
      ...(notifyUrl ? { notify_url: notifyUrl } : {}),
      ...(CHECKOUT_METHODS[order.payment.method] ? { payment_methods: CHECKOUT_METHODS[order.payment.method] } : {}),
    },
    order_note: `MIZAZY order ${order.orderNumber}`,
  });
  return { cfOrderId: data.cf_order_id, paymentSessionId: data.payment_session_id };
}

/** Returns { paid, orderStatus, amount, payment } from Cashfree for an order id. */
export async function fetchCashfreePayment(orderId) {
  const order = await call("GET", `/orders/${encodeURIComponent(orderId)}`);
  let payment = null;
  if (order.order_status === "PAID") {
    const payments = await call("GET", `/orders/${encodeURIComponent(orderId)}/payments`);
    payment = (Array.isArray(payments) ? payments : []).find((p) => p.payment_status === "SUCCESS") || null;
  }
  return { paid: order.order_status === "PAID", orderStatus: order.order_status, amount: Number(order.order_amount), payment };
}

/** Verifies the x-webhook-signature header: base64(HMAC-SHA256(timestamp + rawBody, secret)). */
export function verifyCashfreeWebhook(rawBody, timestamp, signature) {
  const { secret } = settings();
  if (!secret || !rawBody || !timestamp || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(String(timestamp) + rawBody.toString("utf8")).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
