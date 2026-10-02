# MIZAZY E-commerce (MERN)

MongoDB + Express + React + Node.js project with separate frontend and backend.

## Project Structure

```
├── backend/          # Express API + MongoDB (Mongoose)
│   ├── index.js      # Server entry (also serves frontend in production)
│   ├── public/       # Built React app (from `npm run build`)
│   ├── db.js
│   ├── seed.js
│   ├── models/
│   ├── routes/
│   └── middleware/
├── frontend/         # React + Vite + Tailwind CSS
└── package.json      # Hostinger / root scripts
```

## Local development

```bash
npm run install:all
copy backend\.env.example backend\.env
npm run dev:backend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Hostinger Node.js deploy

Use the **Node.js** / Web App section in hPanel ([Hostinger Node.js docs](https://docs.hostinger.com/node.js/creating-an-app)).

Recommended settings:

| Setting | Value |
| --- | --- |
| Framework | Express / Other |
| Node.js version | **20** |
| Root directory | `/` (repo root) |
| Build command | `npm run build` |
| Entry file | `backend/index.js` |
| Start command | `npm start` (or leave default if it uses package.json `start`) |

Environment variables in Hostinger (do **not** upload `.env`):

- `MONGODB_URI` — your Atlas connection string
- `JWT_SECRET` — a long random secret
- `NODE_ENV` — `production`
- `APP_URL` — `https://mizazy.com`
- `ALLOWED_ORIGINS` — `https://mizazy.com,https://www.mizazy.com,http://localhost:5173,http://localhost:5000`
- `CLOUDINARY_CLOUD_NAME` — from Cloudinary dashboard
- `CLOUDINARY_API_KEY` — from Cloudinary dashboard
- `CLOUDINARY_API_SECRET` — from Cloudinary dashboard
- `CLOUDINARY_FOLDER` — optional, default `mizazy`
- `SMTP_HOST` — e.g. `smtp.hostinger.com`
- `SMTP_PORT` — `465` (SSL) or `587` (STARTTLS)
- `SMTP_SECURE` — `true` for 465, `false` for 587
- `ORDERS_SMTP_USER` / `ORDERS_SMTP_PASS` — orders mailbox (`orders@mizazy.com`) for order confirmations and new-order alerts
- `ORDERS_MAIL_FROM` — optional, e.g. `MIZAZY Orders <orders@mizazy.com>`
- `CUSTOMER_SMTP_USER` / `CUSTOMER_SMTP_PASS` — customer mailbox (`customer@mizazy.com`) for forgot-password and welcome emails
- `CUSTOMER_MAIL_FROM` — optional, e.g. `MIZAZY Customer Care <customer@mizazy.com>`
- `PAYMENT_SMTP_USER` / `PAYMENT_SMTP_PASS` — payment mailbox (`payment@mizazy.com`) for online payment receipts
- `PAYMENT_MAIL_FROM` — optional, e.g. `MIZAZY Payments <payment@mizazy.com>`
- `ADMIN_EMAIL` — MIZAZY inbox that receives every new order (defaults to the orders mailbox)
- `CASHFREE_APP_ID` / `CASHFREE_SECRET_KEY` — Cashfree Payments API keys (Dashboard → Developers → API Keys)
- `CASHFREE_ENV` — `sandbox` for test keys, `production` for live keys
- `PORT` — set automatically by Hostinger (do not hardcode)

Site URLs used by the app:

- Production: `https://mizazy.com` and `https://www.mizazy.com`
- Local: `http://localhost:5173` (frontend) and `http://localhost:5000` (API)

What the build does: installs frontend deps, builds React into `backend/public`, then Express serves API + static site together.

## Payments (Cashfree)

- UPI / Card / Net Banking go through Cashfree checkout; Cash on Delivery skips it. Without Cashfree keys, checkout offers COD only.
- Online orders are created with payment `pending`; stock, cart, coupon and emails are processed only after Cashfree reports the order `PAID` (checked server-side via `/api/payments/cashfree/verify` and the webhook).
- Webhook URL to add in the Cashfree dashboard: `https://mizazy.com/api/payments/cashfree/webhook`.
- Payment receipts are sent from the payment mailbox.
- Live (`production`) keys need the site domain whitelisted in Cashfree (Developers → Whitelisting), and only accept https return URLs.
- `/payment-test` (admin session required) runs the real checkout with a ₹1 "Cashfree Test Payment" item, free shipping, no coupon/COD; those orders have `isTest: true` and are excluded from revenue.

## Admin panel

- URL: `/admin` (e.g. https://mizazy.com/admin), API under `/api/admin`.
- Admin accounts live in the `admins` collection (separate from customer `users`); passwords are bcrypt-hashed and changed from **Settings** in the panel.
- Manages orders (including manual tracking status), products, bundles, categories, reviews, coupons, customers, abandoned carts and subscribers.
- Image uploads (`/api/upload/*`) require an admin session.

## Stack

- MongoDB, Express, React 19, Node.js 20
- Vite + Tailwind CSS v4

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
