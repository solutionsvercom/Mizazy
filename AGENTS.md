# MIZAZY E-commerce (MERN)

MongoDB + Express + React + Node.js project with separate frontend and backend.

## Project Structure

```
├── backend/          # Express API + MongoDB (Mongoose)
│   ├── index.js      # Server entry
│   ├── db.js         # MongoDB connection
│   ├── seed.js       # Seed data
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── middleware/   # Auth middleware
├── frontend/         # React + Vite + Tailwind CSS
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api.ts
│       ├── store.tsx
│       ├── components/
│       └── pages/
└── package.json      # Root scripts to run both apps
```

## Setup

1. Install dependencies from the repo root:

```bash
npm run install:all
```

2. Copy env file and edit if needed:

```bash
copy backend\.env.example backend\.env
```

3. Start MongoDB locally (or set `MONGODB_URI` to Atlas). If no MongoDB is available, the API falls back to an in-memory MongoDB server.

## Development

Run API and Vite in two terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: http://localhost:5173 (proxies `/api` → backend)
- Backend: http://localhost:5000

## Stack

- **MongoDB** — database (Mongoose ODM)
- **Express** — REST API in `backend/`
- **React 19** — UI in `frontend/`
- **Node.js** — runtime
- **Vite + Tailwind CSS v4** — frontend tooling

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
