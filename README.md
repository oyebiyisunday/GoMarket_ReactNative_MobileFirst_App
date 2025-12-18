GoMarket — Executive Overview

GoMarket is a multi‑sided marketplace and business management platform. It enables businesses to manage products, inventory, sales, staff, and analytics, while customers discover partner stores, shop across catalogs, checkout, and track orders — all from a single codebase that runs on Web, iOS, and Android.

Value in One Look
- Single codebase delivers Web, iOS, and Android experiences.
- Clear separation of concerns: Frontend app (Expo) + Backend API (Express) + Managed Postgres (Supabase).
- Designed for real operations: inventory tracking, product lifecycle, sales, staff roles, analytics, orders and payments.

Audiences & Use Cases
- Business (Entity)
  - Manage products, pricing, inventory thresholds, staff access, and end‑of‑day reports.
  - Track sales performance and supply levels across stores.
- Customer (Individual)
  - Browse verified partner stores, search products, add to cart, checkout, and track orders.

Platforms (Single Codebase)
- Web, iOS, and Android are delivered from the same React Native + Expo codebase.
- File‑based routing (Expo Router) with segmented layouts for authentication and main app flows.
- Consistent UI components and styling shared across platforms.

Monorepo Layout
- Frontend/ — Expo app (React Native + Expo Router + TypeScript) targeting Web, iOS, Android.
- backend/ - Node.js (Express + TypeScript) REST API using direct PostgreSQL access via the `pg` driver.
- docs/ - Technical documentation and deployment guides.
- scripts/ - Development and deployment automation scripts.

Note: This repo snapshot currently only contains the Expo app under `Frontend/`; the `backend/` directory referenced below is not included. The root npm scripts now target the frontend (`npm start` runs `npm run frontend:web`).

Frontend-only quick start (this repo)
- From the repo root: `npm install` (installs the Frontend dependencies via the updated root scripts).
- Start the web dev server: `npm start` (or `npm run frontend:web`).
- Configure API access in `Frontend/.env` (or copy from `.env.example`) to point at your backend endpoint.

Local Development (split frontend/backend)
- If you add the backend back into the repo, install separately with `npm install --prefix backend` and `npm install --prefix Frontend`. `npm run bootstrap` now only installs the frontend. No implicit postinstall runs anymore.
- Backend (http://localhost:4000 by default):
  - `cd backend && cp .env.example .env` (set `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
  - `npm run dev` (or `npm run dev --prefix backend` from the repo root).
- Frontend:
  - `cd Frontend && cp .env.example .env.local` and set `EXPO_PUBLIC_API_BASE=http://localhost:4000/api`.
  - `npm run web` (or `npm run frontend:web` from the repo root).
- Run both: start backend first, then frontend, or use `scripts/start-all.ps1 -BackendPort 4000` on Windows to launch both terminals with the correct `EXPO_PUBLIC_API_BASE`.

Key Features
- Business: product management, inventory and supply tracking, staff roles, sales, analytics, end-of-day reports.
- Customer: store discovery, unified product search, cart and checkout, orders and status.
- System: secure authentication, role-aware UI routing, resilient API, managed database.

Technology Choices (What & Why)
- Frontend: Expo + React Native + TypeScript for a single, type‑safe codebase across platforms.
- Navigation: Expo Router for predictable, file‑based routing with segmented layouts.
- State: Redux Toolkit for predictable client state and easy slice composition.
- Backend: Express + TypeScript for a concise, reliable REST API surface.
- DB access: direct SQL via the `pg` client (no ORM). Use SQL migrations or your chosen migration tool to manage schema changes.
- Database: Supabase PostgreSQL for managed Postgres with backups and operational tooling.
- Hosting: Railway for API deployment, Vercel for web distribution via CDN.

End‑to‑End Flow (Conceptual)
- The app (Web/iOS/Android) authenticates the user and routes by user type (business vs customer).
- The frontend calls the REST API with a bearer token; the API authorizes and executes domain logic.
- The backend uses direct SQL queries with `pg` to interact with PostgreSQL. Migrations should be managed with SQL migration tooling or CI scripts.
- Web is served from Vercel; the API runs on Railway; both use the same Postgres database.

What’s Implemented
- Cross‑platform UI with shared components and consistent styling.
- Auth with token persistence; role‑based guards and segmented navigation.
- Business modules: product CRUD, inventory, instant sales/tasks, staff views.
- Customer modules: partner store discovery, shopping, checkout, orders.
- Backend modules: authentication, catalog, orders, products, tasks.
- Database schema and migrations tracked in version control.

For deeper detail, see docs/technical-architecture.md and docs/deployment-ops.md.