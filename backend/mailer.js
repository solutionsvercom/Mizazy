import nodemailer from "nodemailer";
import { getPublicSiteUrl } from "./config.js";

/**
 * Sender mailboxes:
 *  - "orders":   order confirmations + new-order alerts (e.g. orders@mizazy.com)
 *  - "customer": account emails like password reset and welcome (e.g. customer@mizazy.com)
 *  - "payment":  online payment receipts (e.g. payment@mizazy.com)
 * Each mailbox authenticates with its own credentials so the From address matches the login.
 */
const MAILBOXES = {
  orders: {
    user: () => process.env.ORDERS_SMTP_USER || process.env.SMTP_USER,
    pass: () => process.env.ORDERS_SMTP_PASS || process.env.SMTP_PASS,
    from: () => process.env.ORDERS_MAIL_FROM || process.env.MAIL_FROM,
    label: "MIZAZY Orders",
  },
  customer: {
    user: () => process.env.CUSTOMER_SMTP_USER,
    pass: () => process.env.CUSTOMER_SMTP_PASS,
    from: () => process.env.CUSTOMER_MAIL_FROM,
    label: "MIZAZY Customer Care",
  },
  payment: {
    user: () => process.env.PAYMENT_SMTP_USER,
    pass: () => process.env.PAYMENT_SMTP_PASS,
    from: () => process.env.PAYMENT_MAIL_FROM,
    label: "MIZAZY Payments",
  },
};

const transporters = {};

function mailbox(kind) {
  const box = MAILBOXES[kind];
  const user = box.user();
  const pass = box.pass();
  if (!process.env.SMTP_HOST || !user || !pass) return null;
  if (!transporters[kind]) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporters[kind] = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user, pass },
    });
  }
  return { transport: transporters[kind], user, from: box.from() || `${box.label} <${user}>` };
}

export async function verifyMailer() {
  const status = {};
  for (const kind of Object.keys(MAILBOXES)) {
    const box = mailbox(kind);
    if (!box) {
      status[kind] = "not configured";
      continue;
    }
    try {
      await box.transport.verify();
      status[kind] = `ok (${box.user})`;
    } catch (err) {
      status[kind] = `failed (${box.user}): ${err.message}`;
    }
  }
  return status;
}

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const PAYMENT_LABELS = {
  upi: "UPI",
  card: "Card",
  cod: "Cash on Delivery",
  netbanking: "Net Banking",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  net_banking: "Net Banking",
  wallet: "Wallet",
  pay_later: "Pay Later",
  cardless_emi: "Cardless EMI",
  credit_card_emi: "Credit Card EMI",
  debit_card_emi: "Debit Card EMI",
};

function button(href, text) {
  return `<p style="margin:24px 0 0;"><a href="${escapeHtml(href)}" style="background:#D4A520;color:#050505;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">${escapeHtml(text)}</a></p>`;
}

function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;"><tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#050505;padding:20px 28px;color:#D4A520;font-size:22px;font-weight:bold;letter-spacing:3px;">MIZAZY</td></tr>
        <tr><td style="padding:28px;">
          <h1 style="font-size:20px;color:#111;margin:0 0 14px;">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px;">MIZAZY · ${escapeHtml(getPublicSiteUrl())}</td></tr>
      </table>
    </td></tr></table></body></html>`;
}

function orderDetailsHtml(order) {
  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(i.name)}</strong><br/>
            <span style="color:#777;font-size:13px;">${escapeHtml(i.colorName)} · Qty ${i.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${rupees(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");
  const t = order.totals;
  const a = order.address;
  const delivery = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222;">${rows}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222;margin-top:12px;">
      <tr><td style="padding:3px 0;color:#777;">Subtotal</td><td style="text-align:right;">${rupees(t.subtotal)}</td></tr>
      ${t.couponDiscount ? `<tr><td style="padding:3px 0;color:#777;">Coupon (${escapeHtml(order.coupon)})</td><td style="text-align:right;">−${rupees(t.couponDiscount)}</td></tr>` : ""}
      <tr><td style="padding:3px 0;color:#777;">Shipping</td><td style="text-align:right;">${t.shipping ? rupees(t.shipping) : "Free"}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;font-size:16px;">Total</td><td style="text-align:right;font-weight:bold;font-size:16px;">${rupees(t.total)}</td></tr>
    </table>
    <p style="font-size:14px;color:#222;margin:18px 0 4px;"><strong>Delivery address</strong></p>
    <p style="font-size:14px;color:#555;margin:0;line-height:1.5;">
      ${escapeHtml(a.name)} · ${escapeHtml(a.phone)}<br/>
      ${escapeHtml(a.address)}, ${escapeHtml(a.city)}, ${escapeHtml(a.state)} - ${escapeHtml(a.pincode)}
    </p>
    <p style="font-size:14px;color:#555;margin:14px 0 0;">
      Payment: ${escapeHtml(PAYMENT_LABELS[order.payment?.paymentGroup] || PAYMENT_LABELS[order.payment?.method] || order.payment?.method)}${order.payment?.gateway && order.payment?.status === "confirmed" ? " · Paid online" : ""}
      ${delivery ? `<br/>Expected delivery: ${delivery} (${escapeHtml(order.shippingPartner)})` : ""}
    </p>`;
}

function logFailures(context, results) {
  for (const r of results) {
    if (r.status === "rejected") console.error(`${context} email failed:`, r.reason?.message || r.reason);
  }
}

/** Order confirmation to the customer + new-order alert to ADMIN_EMAIL, sent from the orders mailbox. Never throws. */
export async function sendOrderEmails(order, user) {
  const box = mailbox("orders");
  if (!box) {
    console.warn("Orders mailbox not configured — skipping order emails for", order.orderNumber);
    return;
  }
  const adminTo = process.env.ADMIN_EMAIL || box.user;
  const customerTo = order.email || user?.email;
  const first = escapeHtml((user?.name || order.address.name || "").split(" ")[0]);

  const jobs = [];
  if (customerTo) {
    jobs.push(
      box.transport.sendMail({
        from: box.from,
        to: customerTo,
        subject: `Your MIZAZY order ${order.orderNumber} is confirmed`,
        html: layout(
          `Thank you for your order${first ? `, ${first}` : ""}!`,
          `<p style="font-size:14px;color:#555;margin:0 0 18px;">Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been confirmed. You can track it anytime from <strong>My Account</strong> on our website.</p>
           ${orderDetailsHtml(order)}
           ${button(`${getPublicSiteUrl()}/track`, "Track your order")}`
        ),
      })
    );
  }
  jobs.push(
    box.transport.sendMail({
      from: box.from,
      to: adminTo,
      replyTo: customerTo || undefined,
      subject: `New order ${order.orderNumber} · ${rupees(order.totals.total)} · ${order.address.name}`,
      html: layout(
        `New order ${escapeHtml(order.orderNumber)}`,
        `<p style="font-size:14px;color:#555;margin:0 0 18px;">
           Customer: <strong>${escapeHtml(order.address.name)}</strong><br/>
           Phone: ${escapeHtml(order.address.phone)}<br/>
           Email: ${escapeHtml(customerTo || "Guest checkout (no email)")}
         </p>
         ${orderDetailsHtml(order)}`
      ),
    })
  );

  logFailures(`Order ${order.orderNumber}`, await Promise.allSettled(jobs));
}

/** Online payment receipt to the customer, sent from the payment mailbox. Never throws. */
export async function sendPaymentReceiptEmail(order, user) {
  if (!mailbox("payment") || !(order.email || user?.email)) return;
  logFailures(`Payment receipt ${order.orderNumber}`, await Promise.allSettled([sendPaymentConfirmationEmail(order, user)]));
}

/** Payment confirmation / receipt from the payment mailbox. Throws if it can't be sent. */
export async function sendPaymentConfirmationEmail(order, user) {
  const box = mailbox("payment");
  if (!box) throw new Error("Payment mailbox (payment@mizazy.com) is not configured");
  const to = order.email || user?.email;
  if (!to) throw new Error("This order has no customer email. Add one under Customer → Customer email and save first.");
  const p = order.payment || {};
  const online = Boolean(p.gateway);
  const first = escapeHtml((user?.name || order.address.name || "").split(" ")[0]);
  const paidAt = new Date(p.paidAt || Date.now()).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata",
  });
  const row = (label, value) =>
    `<tr><td style="padding:6px 0;color:#777;">${label}</td><td style="padding:6px 0;text-align:right;color:#222;">${value}</td></tr>`;

  await box.transport.sendMail({
    from: box.from,
    to,
    replyTo: process.env.ADMIN_EMAIL || undefined,
    subject: `Payment received · ${rupees(order.totals.total)} for MIZAZY order ${order.orderNumber}`,
    html: layout(
      `Payment received${first ? `, ${first}` : ""}`,
      `<p style="font-size:14px;color:#555;margin:0 0 18px;">We've received your payment. This email is your receipt.</p>
       <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #eee;border-bottom:1px solid #eee;">
         ${row("Amount paid", `<strong>${rupees(order.totals.total)}</strong>`)}
         ${row("Order ID", escapeHtml(order.orderNumber))}
         ${p.cfPaymentId ? row("Transaction ID", escapeHtml(p.cfPaymentId)) : ""}
         ${row("Payment method", escapeHtml(PAYMENT_LABELS[p.paymentGroup] || PAYMENT_LABELS[p.method] || p.method))}
         ${row("Paid on", escapeHtml(paidAt))}
       </table>
       <p style="font-size:12px;color:#999;margin:18px 0 0;">${online ? "Payments are processed securely by Cashfree Payments. " : ""}Keep this email for your records.</p>
       ${button(`${getPublicSiteUrl()}/track`, "Track your order")}`
    ),
  });
}

/** Password reset link, sent from the customer mailbox. Throws if the mailbox is not configured or sending fails. */
export async function sendPasswordResetEmail(user, resetUrl, minutesValid) {
  const box = mailbox("customer");
  if (!box) throw new Error("Customer mailbox not configured");
  const first = escapeHtml(user.name.split(" ")[0]);
  await box.transport.sendMail({
    from: box.from,
    to: user.email,
    subject: "Reset your MIZAZY password",
    html: layout(
      `Hi ${first}, reset your password`,
      `<p style="font-size:14px;color:#555;margin:0 0 6px;">We received a request to reset the password for your MIZAZY account (${escapeHtml(user.email)}).</p>
       <p style="font-size:14px;color:#555;margin:0;">This link is valid for ${minutesValid} minutes and can be used only once.</p>
       ${button(resetUrl, "Reset password")}
       <p style="font-size:12px;color:#999;margin:24px 0 0;">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>`
    ),
  });
}

const emailImage = (url) =>
  String(url || "").replace("/image/upload/", "/image/upload/f_jpg,q_auto,w_160,h_160,c_pad,b_white/");

/** Subject + HTML for an abandoned-cart reminder. stage: "first" | "offer" | "daily". */
export function cartReminderEmail({ user, items, stage, coupon, checkoutUrl, unsubscribeUrl }) {
  const firstName = String(user.name || "").trim().split(" ")[0];
  const first = escapeHtml(firstName);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const rows = items
    .map(
      (i) => `
        <tr>
          <td width="72" style="padding:10px 12px 10px 0;border-bottom:1px solid #eee;">
            ${i.image ? `<img src="${escapeHtml(emailImage(i.image))}" width="64" height="64" alt="" style="display:block;border-radius:8px;border:1px solid #eee;"/>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;">
            <strong>${escapeHtml(i.name)}</strong><br/>
            <span style="color:#777;font-size:13px;">${i.colorName ? `${escapeHtml(i.colorName)} · ` : ""}Qty ${i.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-size:14px;color:#222;">${rupees(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const couponBox = coupon
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="border:2px dashed #D4A520;border-radius:10px;padding:16px;text-align:center;background:#fffaf0;">
         <div style="font-size:13px;color:#777;">Your personal code for ${coupon.percent}% off</div>
         <div style="font-size:24px;font-weight:bold;letter-spacing:3px;color:#111;margin-top:6px;">${escapeHtml(coupon.code)}</div>
         <div style="font-size:12px;color:#999;margin-top:6px;">Sign in with ${escapeHtml(user.email)} and apply it at checkout.</div>
       </td></tr></table>`
    : "";

  const copy = {
    first: {
      subject: `${firstName}, you left something in your cart`,
      title: "Continue where you left off",
      intro: "Your MIZAZY picks are still waiting in your cart. Complete your checkout before they sell out.",
      cta: "Complete checkout",
    },
    offer: {
      subject: `${firstName}, here's ${coupon?.percent}% off your cart`,
      title: `${coupon?.percent}% off, just for you`,
      intro: "Still thinking it over? Here's a little something to help you decide. Use your personal code below and save on your cart.",
      cta: `Checkout with ${coupon?.percent}% off`,
    },
    daily: {
      subject: `Your cart is still waiting · ${coupon?.percent}% off with ${coupon?.code}`,
      title: "Your cart is still waiting",
      intro: `The items you picked are still in your cart and your ${coupon?.percent}% off code is still active.`,
      cta: "Complete checkout",
    },
  }[stage];

  const html = layout(
    `${copy.title}${stage === "first" && first ? `, ${first}` : ""}`,
    `<p style="font-size:14px;color:#555;margin:0 0 18px;">${copy.intro}</p>
     ${couponBox}
     <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
     <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#222;margin-top:12px;">
       <tr><td style="padding:3px 0;font-weight:bold;">Cart subtotal</td><td style="text-align:right;font-weight:bold;">${rupees(subtotal)}</td></tr>
       ${coupon ? `<tr><td style="padding:3px 0;color:#2e7d32;">With ${escapeHtml(coupon.code)}</td><td style="text-align:right;color:#2e7d32;font-weight:bold;">${rupees(subtotal - Math.round(subtotal * (coupon.percent / 100)))}</td></tr>` : ""}
     </table>
     ${button(checkoutUrl, copy.cta)}
     <p style="font-size:12px;color:#999;margin:28px 0 0;">You're receiving this because you left items in your cart at MIZAZY. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#999;">Stop cart reminders</a></p>`
  );
  return { subject: copy.subject, html };
}

/** Abandoned-cart reminder, sent from the customer mailbox. Throws if the mailbox is not configured or sending fails. */
export async function sendCartReminderEmail(params) {
  const box = mailbox("customer");
  if (!box) throw new Error("Customer mailbox not configured");
  const { subject, html } = cartReminderEmail(params);
  await box.transport.sendMail({
    from: box.from,
    to: params.user.email,
    subject,
    html,
    headers: { "List-Unsubscribe": `<${params.unsubscribeUrl}>` },
  });
}

/** Welcome email after registration, sent from the customer mailbox. Never throws. */
export async function sendWelcomeEmail(user) {
  const box = mailbox("customer");
  if (!box) return;
  const first = escapeHtml(user.name.split(" ")[0]);
  logFailures("Welcome", await Promise.allSettled([
    box.transport.sendMail({
      from: box.from,
      to: user.email,
      subject: "Welcome to MIZAZY",
      html: layout(
        `Welcome to MIZAZY, ${first}!`,
        `<p style="font-size:14px;color:#555;margin:0;">Your account is ready. Sign in anytime to track your orders, save products to your wishlist and check out faster.</p>
         ${button(getPublicSiteUrl(), "Start shopping")}`
      ),
    }),
  ]));
}
