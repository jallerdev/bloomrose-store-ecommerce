# Bloom Rose E-commerce 🎀

A modern, elegant, and high-performance e-commerce platform designed specifically for selling women's accessories (earrings, necklaces, bracelets). Built with the latest technologies in the React ecosystem to deliver a fast and scalable interactive experience.

## 🚀 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Auth0 v4](https://auth0.com/) (Server-side Session Management)
- **Global State (Cart):** [Zustand](https://zustand-demo.pmnd.rs/) (with LocalStorage persistence)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) base components
- **Iconography:** [Lucide React](https://lucide.dev/)

## ✨ Key Features

1. **Dynamic Catalog & Routing (SSR):**
   Detailed product pages (`/productos/[slug]`) are rendered directly on the server (_Server-Side Rendering_) fetching from the DB, ensuring immediate load times and perfect SEO.
2. **Persistent & Interactive Shopping Cart:**
   Global state managed with Zustand. Supports real-time inventory validation, individual sub-variant addition (e.g., Gold vs. Silver), and `localStorage` saving to prevent cart loss on refresh. Housed in a sleek slide-out drawer (_Sheet_).

3. **Protected Admin Dashboard:**
   An internal dashboard under the `/admin/*` path to manage products and categories. Strictly protected with Auth0 middleware (`proxy.ts`), preventing unauthorized access.

4. **Seamless Authentication Integration:**
   Secure login flow and profile synchronization managed via `@auth0/nextjs-auth0` server-side APIs.

## ⚙️ Setup & Local Development

### 1. Clone & Install

Clone the repository and install dependencies using your preferred package manager:

```bash
git clone <repository-url>
cd bloomrose-ecommerce
pnpm install
# or npm install / yarn install
```

### 2. Environment Variables

Copy the example file and configure your local credentials in `.env.local`:

```bash
cp .env.local.example .env.local
```

> **Database Note:** Ensure you use the **5432 (Session Pooler)** port from Supabase in your `DATABASE_URL` so Drizzle can perform introspection freely without network transaction locks.

### 3. Schema Migration (Drizzle)

Sync the database tables from the models in `/lib/db/schema.ts` to your configured database:

```bash
npx drizzle-kit push
```

### 4. Start Development Server

```bash
pnpm dev
```

Launch the environment at `http://localhost:3000`.

## 📂 Project Structure

- `/app` — App Router routes, layouts, pages, and Next.js 16 proxy.
- `/components` — Atomic and functional UI elements built on Radix and Tailwind.
- `/lib/db` — Drizzle ORM schemas and PostgreSQL connector singleton.
- `/lib/store` — Centralized Business Logic and Data-Stores (e.g., Zustand Cart).
- `/public` — Static assets, default images, and icons.

## 🤝 Support & Contribution

For new implementations, please refer to the base architecture described in `agents.md`, which dictates all UI interaction design patterns, SSR, and persistence rules for the platform.
