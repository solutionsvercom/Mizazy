import type { ReactNode } from "react";

export const CONTACT_EMAIL = "contact@mizazy.com";

export type InfoTopic = "contact" | "shipping" | "returns" | "warranty" | "privacy" | "terms" | "refund";

const H = ({ children }: { children: ReactNode }) => (
  <h3 className="font-display font-700 text-white text-sm mt-5 mb-2 first:mt-0">{children}</h3>
);
const P = ({ children }: { children: ReactNode }) => <p className="mb-2.5">{children}</p>;
const List = ({ items }: { items: ReactNode[] }) => (
  <ul className="space-y-1.5 mb-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2">
        <span className="text-[#D4A520] flex-shrink-0">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
const Mail = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#D4A520] hover:underline">
    {CONTACT_EMAIL}
  </a>
);

export const INFO_TOPICS: Record<InfoTopic, { title: string; body: ReactNode }> = {
  contact: {
    title: "Contact Us",
    body: (
      <>
        <P>We're here to help with orders, products, returns and warranty claims.</P>
        <div className="rounded-xl border border-[#D4A520]/25 bg-[#D4A520]/[0.06] p-4 mb-4">
          <p className="text-white/45 text-xs mb-1">Email us</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-display font-700 text-[#D4A520] text-lg hover:underline">
            {CONTACT_EMAIL}
          </a>
          <p className="text-white/40 text-xs mt-2">Every day, 9 AM – 9 PM IST · We reply within 24 hours</p>
        </div>
        <H>To help us respond faster</H>
        <List
          items={[
            "Mention your Order ID (for example MZ-12345678) for order-related questions.",
            "Add photos or a short video if a product is damaged or not working.",
            "Use the email address linked to your MIZAZY account.",
          ]}
        />
        <P>You can also check live order status anytime from My Account → My Orders.</P>
      </>
    ),
  },
  shipping: {
    title: "Shipping Information",
    body: (
      <>
        <H>Delivery options</H>
        <List
          items={[
            <><strong className="text-white/80">Standard delivery:</strong> 3–5 business days. Free on orders above ₹999, otherwise ₹99.</>,
            <><strong className="text-white/80">Express delivery:</strong> next-day delivery in serviceable cities for ₹149.</>,
          ]}
        />
        <H>Dispatch & tracking</H>
        <List
          items={[
            "Orders placed before 5 PM are usually dispatched the same day.",
            "We ship across India with BlueDart Express to 200+ cities.",
            "Your tracking number is shared once the order is shipped, and live status is available in My Account → My Orders.",
          ]}
        />
        <H>Good to know</H>
        <List
          items={[
            "Cash on Delivery is available on eligible pincodes.",
            "Delivery timelines may be longer for remote areas or during sales and public holidays.",
            "Please make sure your address and phone number are correct so the courier can reach you.",
          ]}
        />
        <P>
          Questions about a delivery? Write to <Mail /> with your Order ID.
        </P>
      </>
    ),
  },
  returns: {
    title: "Returns",
    body: (
      <>
        <P>Not happy with your purchase? You can return it within 7 days of delivery.</P>
        <H>Eligibility</H>
        <List
          items={[
            "The product is unused and in its original packaging.",
            "All accessories, manuals and freebies are included.",
            "The request is raised within 7 days of delivery.",
          ]}
        />
        <H>How to return</H>
        <List
          items={[
            <>Email <Mail /> with your Order ID, the product and the reason for return.</>,
            "Our team confirms the request and arranges a pickup from your address.",
            "Once the product passes a quality check, your refund or replacement is processed.",
          ]}
        />
        <H>Damaged or wrong product?</H>
        <P>Report it within 48 hours of delivery with photos or an unboxing video and we'll send a replacement at no extra cost.</P>
        <H>Not eligible for return</H>
        <List items={["Products with physical or liquid damage caused after delivery.", "Products with missing accessories or packaging."]} />
      </>
    ),
  },
  warranty: {
    title: "Warranty",
    body: (
      <>
        <P>Every MIZAZY product comes with a 1-year warranty from the date of delivery against manufacturing defects.</P>
        <H>What's covered</H>
        <List items={["Manufacturing defects in materials or workmanship.", "Products that stop working under normal use."]} />
        <H>What's not covered</H>
        <List
          items={[
            "Physical damage, drops, cuts or liquid damage.",
            "Damage from using incompatible or faulty chargers and power sources.",
            "Repairs or modifications by anyone other than MIZAZY.",
            "Normal wear and tear, scratches and cosmetic damage.",
          ]}
        />
        <H>How to claim</H>
        <List
          items={[
            <>Email <Mail /> with your Order ID, the product name and a short description of the issue.</>,
            "Attach photos or a video showing the problem.",
            "After verification, we repair or replace the product.",
          ]}
        />
      </>
    ),
  },
  refund: {
    title: "Refund Policy",
    body: (
      <>
        <H>When refunds are issued</H>
        <List
          items={[
            "Approved returns, after the returned product passes our quality check.",
            "Orders cancelled before they are shipped.",
            "Orders that cannot be delivered to your address.",
          ]}
        />
        <H>Refund timelines</H>
        <List
          items={[
            "Prepaid orders (UPI, card, net banking) are refunded to the original payment method within 5–7 business days.",
            "Cash on Delivery orders are refunded to your bank account or UPI ID, which we will ask for over email.",
          ]}
        />
        <H>Please note</H>
        <List
          items={[
            "Shipping charges are refunded only if the product was damaged, defective or incorrect.",
            "Coupon discounts are not refundable as cash.",
          ]}
        />
        <P>
          For refund questions, write to <Mail /> with your Order ID.
        </P>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <P>MIZAZY Technologies Pvt. Ltd. respects your privacy. This summary explains what we collect and why.</P>
        <H>What we collect</H>
        <List
          items={[
            "Your name, email, phone number and delivery addresses.",
            "Your orders, cart and wishlist.",
            "Basic technical data needed to keep you signed in and remember your cart.",
          ]}
        />
        <H>How we use it</H>
        <List
          items={[
            "To process, ship and support your orders.",
            "To send order confirmations, account emails and reminders about items left in your cart. You can unsubscribe from cart reminders at any time.",
            "To improve our products and website.",
          ]}
        />
        <H>What we don't do</H>
        <List
          items={[
            "We never sell your personal information.",
            "Card and UPI payments are handled by secure payment partners, and we don't store your card details.",
          ]}
        />
        <P>
          We share delivery details only with our courier partners to deliver your order. To access or delete your data, email <Mail />.
        </P>
      </>
    ),
  },
  terms: {
    title: "Terms of Use",
    body: (
      <>
        <P>By using mizazy.com and placing an order, you agree to these terms.</P>
        <H>Orders & pricing</H>
        <List
          items={[
            "All prices are in Indian Rupees and include applicable taxes.",
            "An order is confirmed once you receive an order confirmation from us.",
            "We may cancel an order in case of stock unavailability, pricing errors or suspected misuse, with a full refund for any amount paid.",
          ]}
        />
        <H>Your account</H>
        <List
          items={[
            "Keep your password confidential. You're responsible for activity on your account.",
            "Provide accurate contact and delivery details.",
          ]}
        />
        <H>Coupons & offers</H>
        <List
          items={[
            "Coupons are valid for a limited time, can't be combined unless stated, and personal coupons work only on the account they were issued to.",
            "Offers may change or end without prior notice.",
          ]}
        />
        <H>Content</H>
        <P>All content, images and branding on this website belong to MIZAZY and may not be reused without permission.</P>
        <P>
          Questions about these terms? Contact <Mail />.
        </P>
      </>
    ),
  },
};

/** Footer link label → pop-up topic. */
export const FOOTER_TOPICS: Record<string, InfoTopic> = {
  "Contact Us": "contact",
  "Shipping Info": "shipping",
  Returns: "returns",
  Warranty: "warranty",
  "Privacy Policy": "privacy",
  "Terms of Use": "terms",
  "Refund Policy": "refund",
  "Shipping Policy": "shipping",
};
