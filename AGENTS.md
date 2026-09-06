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
- `PORT` — set automatically by Hostinger (do not hardcode)

What the build does: installs frontend deps, builds React into `backend/public`, then Express serves API + static site together.

## Stack

- MongoDB, Express, React 19, Node.js 20
- Vite + Tailwind CSS v4

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
