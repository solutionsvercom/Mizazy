import { useMemo, useState } from "react";
import { CONTACT_EMAIL } from "../helpContent";

interface FaqPageProps {
  onNavigate: (page: string) => void;
}

const FAQ_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Orders & Payment",
    items: [
      { q: "How do I place an order?", a: "Add products to your cart, click Checkout, enter your delivery address, choose a delivery option and payment method, then review and place your order. You'll get a confirmation email with your Order ID." },
      { q: "Which payment methods do you accept?", a: "UPI, debit and credit cards, net banking and Cash on Delivery (on eligible pincodes)." },
      { q: "Is it safe to pay on MIZAZY?", a: "Yes. Payments are processed by secure payment partners with bank-grade encryption, and we never store your card details." },
      { q: "Can I cancel my order?", a: `Yes, before it is shipped. Email ${CONTACT_EMAIL} with your Order ID and we'll cancel it and refund any amount paid.` },
      { q: "Can I change my delivery address after ordering?", a: `If the order hasn't shipped yet, email ${CONTACT_EMAIL} with your Order ID and the new address and we'll update it.` },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery reaches you the next day in serviceable cities." },
      { q: "How much does shipping cost?", a: "Standard delivery is free on orders above ₹999, otherwise ₹99. Express delivery costs ₹149." },
      { q: "How do I track my order?", a: "Sign in and open My Account → My Orders, or use Track Order. You'll see live status from confirmation to delivery, along with your BlueDart tracking number." },
      { q: "Do you deliver all over India?", a: "We deliver to 200+ cities across India through BlueDart Express. Remote areas may take a little longer." },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      { q: "What is your return policy?", a: "You can return a product within 7 days of delivery if it's unused and in its original packaging with all accessories." },
      { q: "How do I return a product?", a: `Email ${CONTACT_EMAIL} with your Order ID and reason for return. We'll arrange a pickup, and once the product passes a quality check, your refund or replacement is processed.` },
      { q: "When will I get my refund?", a: "Prepaid orders are refunded to the original payment method within 5–7 business days after the quality check. Cash on Delivery orders are refunded to your bank account or UPI ID." },
      { q: "I received a damaged or wrong product. What should I do?", a: "Report it within 48 hours of delivery with photos or an unboxing video and we'll send a replacement at no extra cost." },
    ],
  },
  {
    title: "Warranty",
    items: [
      { q: "Do MIZAZY products come with a warranty?", a: "Yes. Every product has a 1-year warranty from the date of delivery against manufacturing defects." },
      { q: "What does the warranty not cover?", a: "Physical or liquid damage, damage from incompatible chargers, unauthorised repairs, and normal wear and tear." },
      { q: "How do I make a warranty claim?", a: `Email ${CONTACT_EMAIL} with your Order ID, the product name, a description of the issue and photos or a video. After verification we'll repair or replace it.` },
    ],
  },
  {
    title: "Products & Compatibility",
    items: [
      { q: "Does the 20W USB-C adapter work with iPhone?", a: "Yes. The Mizazy 20W USB-C Power Adapter supports fast charging for compatible iPhones using a USB-C to Lightning or USB-C to USB-C cable." },
      { q: "Will the fast chargers and cables work with my Android phone?", a: "Yes. Our chargers and cables work with most USB Type-C Android phones. Charging speed depends on what your phone supports." },
      { q: "Are MIZAZY products genuine and certified?", a: "Yes. Every product is 100% genuine, BIS certified and passes quality checks before it ships." },
      { q: "How do I pair MIZAZY earbuds or neckbands?", a: "Turn on Bluetooth on your phone, power on the earbuds or neckband, and select the MIZAZY device from the Bluetooth list. Supported Android phones may also show a quick pairing pop-up." },
    ],
  },
  {
    title: "Account & Offers",
    items: [
      { q: "Do I need an account to order?", a: "You can check out as a guest, but signing in lets you track orders, save addresses and your wishlist, and receive order emails." },
      { q: "I forgot my password. What do I do?", a: "Click Sign in → Forgot password, enter your account email and we'll send you a link to set a new password." },
      { q: "How do I use a coupon code?", a: "Enter the code in the Coupon box on the checkout page and click Apply. The discount is shown in your order summary before you pay." },
      { q: "Why am I getting emails about my cart?", a: "If you leave items in your cart, we send a few reminders, sometimes with a personal discount. You can stop them anytime using the link at the bottom of the email." },
    ],
  },
];

export default function FaqPage({ onNavigate }: FaqPageProps) {
  const [open, setOpen] = useState<string | null>(`${FAQ_GROUPS[0].title}-0`);
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQ_GROUPS;
    return FAQ_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)),
    })).filter((g) => g.items.length);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#050505] py-12 pb-32 md:pb-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <button onClick={() => onNavigate("home")} className="text-white/40 hover:text-white text-sm mb-8 transition-colors">
          ← Back to home
        </button>
        <p className="section-label mb-2">Help Center</p>
        <h1 className="section-heading text-4xl sm:text-5xl text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-white/40 mb-8">Everything you need to know about orders, delivery, returns and your MIZAZY gadgets.</p>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#D4A520]/50 mb-10"
        />

        {groups.length === 0 && (
          <p className="text-white/40 text-sm mb-10">No questions match "{search}". Try another word or contact us below.</p>
        )}

        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="font-display font-700 text-[#D4A520] text-xs uppercase tracking-widest mb-4">{group.title}</h2>
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] divide-y divide-white/5">
                {group.items.map((item, i) => {
                  const id = `${group.title}-${i}`;
                  const isOpen = open === id || Boolean(search.trim());
                  return (
                    <div key={id}>
                      <button
                        onClick={() => setOpen(open === id ? null : id)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="font-display font-600 text-white/85 text-sm">{item.q}</span>
                        <span className={`text-[#D4A520] text-lg leading-none transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                      </button>
                      {isOpen && <p className="px-5 pb-5 -mt-1 text-white/50 text-sm leading-relaxed">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-[#D4A520]/25 bg-[#D4A520]/[0.05] p-6 text-center">
          <h2 className="font-display font-700 text-white text-lg mb-1">Still have questions?</h2>
          <p className="text-white/45 text-sm mb-4">Our team replies within 24 hours, every day from 9 AM to 9 PM.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary inline-block py-2.5 px-6 text-sm">
            Email {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
