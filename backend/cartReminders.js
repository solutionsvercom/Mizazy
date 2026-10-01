import crypto from "crypto";
import Cart from "./models/Cart.js";
import Coupon from "./models/Coupon.js";
import Product from "./models/Product.js";
import { getPublicSiteUrl } from "./config.js";
import { sendCartReminderEmail } from "./mailer.js";

const HOUR = 60 * 60 * 1000;
const FIRST_REMINDER_AFTER = 1 * HOUR;
const FOLLOW_UP_EVERY = 24 * HOUR;
const CHECK_EVERY = 15 * 60 * 1000;
const COUPON_PERCENT = 10;

const unsubscribeSecret = () => process.env.JWT_SECRET || "mizazy-dev-secret-change-in-production";

export function unsubscribeSignature(userId) {
  return crypto.createHmac("sha256", unsubscribeSecret()).update(`cart-reminders:${userId}`).digest("hex");
}

export function isValidUnsubscribe(userId, signature) {
  const expected = Buffer.from(unsubscribeSignature(String(userId)));
  const given = Buffer.from(String(signature || ""));
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

function unsubscribeUrl(userId) {
  return `${getPublicSiteUrl()}/api/cart/unsubscribe?u=${userId}&s=${unsubscribeSignature(userId)}`;
}

/** Personal 10% code: first name + "MZ1" (e.g. HARSHMZ1); a number is added if another account already owns that code. */
export async function ensurePersonalCoupon(user) {
  const existing = await Coupon.findOne({ user: user._id });
  if (existing) {
    if (!existing.active || existing.discountPercent !== COUPON_PERCENT) {
      existing.active = true;
      existing.discountPercent = COUPON_PERCENT;
      await existing.save();
    }
    return existing;
  }
  const base =
    String(user.name || "").trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "MIZAZY";
  for (let n = 1; n <= 500; n++) {
    const code = `${base}${n === 1 ? "" : n}MZ1`;
    if (await Coupon.exists({ code })) continue;
    try {
      return await Coupon.create({ code, user: user._id, discountPercent: COUPON_PERCENT, active: true });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }
  throw new Error(`Could not create a coupon code for user ${user._id}`);
}

async function reminderItems(cart) {
  const products = await Product.find({ id: { $in: cart.items.map((i) => i.productId) } });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  return cart.items
    .filter((i) => byId[i.productId])
    .map((i) => {
      const p = byId[i.productId];
      return { name: p.name, image: p.image, price: p.price, quantity: i.quantity, colorName: i.colorName };
    });
}

/**
 * Sends whichever reminder is due for each abandoned cart:
 *  1st: one hour after the cart was last changed — "continue where you left off"
 *  2nd: one day later — personal 10% coupon
 *  3rd onwards: once a day with the same coupon, until the customer checks out, empties the cart or unsubscribes.
 */
export async function runCartReminders({ now = new Date(), send = sendCartReminderEmail } = {}) {
  const carts = await Cart.find({
    "items.0": { $exists: true },
    $or: [
      { remindersSent: 0, itemsUpdatedAt: { $lte: new Date(now - FIRST_REMINDER_AFTER) } },
      { remindersSent: { $gte: 1 }, lastReminderAt: { $lte: new Date(now - FOLLOW_UP_EVERY) } },
    ],
  })
    .populate("user")
    .limit(200);

  let sent = 0;
  for (const cart of carts) {
    const user = cart.user;
    if (!user?.email || user.cartRemindersOptOut) continue;
    try {
      const items = await reminderItems(cart);
      if (!items.length) continue;

      const stage = cart.remindersSent === 0 ? "first" : cart.remindersSent === 1 ? "offer" : "daily";
      const previous = { remindersSent: cart.remindersSent, lastReminderAt: cart.lastReminderAt ?? null };
      // Claim the cart before sending so overlapping runs can't email the same customer twice.
      const claim = await Cart.updateOne(
        { _id: cart._id, remindersSent: cart.remindersSent },
        { $inc: { remindersSent: 1 }, $set: { lastReminderAt: now } }
      );
      if (!claim.modifiedCount) continue;

      try {
        const coupon = stage === "first" ? null : await ensurePersonalCoupon(user);
        await send({
          user,
          items,
          stage,
          coupon: coupon && { code: coupon.code, percent: coupon.discountPercent },
          checkoutUrl: `${getPublicSiteUrl()}/checkout${coupon ? `?coupon=${encodeURIComponent(coupon.code)}` : ""}`,
          unsubscribeUrl: unsubscribeUrl(user._id),
        });
        sent++;
      } catch (err) {
        await Cart.updateOne({ _id: cart._id }, { $set: previous });
        throw err;
      }
    } catch (err) {
      console.error(`Cart reminder for ${user.email} failed:`, err.message);
    }
  }
  return sent;
}

export function startCartReminders() {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const sent = await runCartReminders();
      if (sent) console.log(`Cart reminders sent: ${sent}`);
    } catch (err) {
      console.error("Cart reminder run failed:", err.message);
    } finally {
      running = false;
    }
  };
  setTimeout(tick, 60 * 1000);
  setInterval(tick, CHECK_EVERY).unref();
}
