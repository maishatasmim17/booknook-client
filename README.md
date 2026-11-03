# BookNook – A Small Online Library

BookNook is a cozy online library where readers can browse the catalog, add new books, borrow copies for a few days, and return them when they are done. The whole experience is built around one simple loop: **add a book, borrow a book, return a book.**

**Live Site:** _Add your deployed Vercel URL here after deployment (for example `https://booknook-client.vercel.app`)._

**API:** _Add your deployed Render URL here after deployment (for example `https://booknook-server.onrender.com/api/v1`)._

---

## Features

- **Curated home experience** – a Swiper hero slider with three slides, a live “New Arrivals” section powered by the newest MongoDB records, and extra sections for popular categories and how borrowing works.
- **Full catalog with search and filters** – browse every book in a responsive 3-column grid, search by title/author/category, filter by category or availability, and sort by newest, title, rating, or copies.
- **Better Auth authentication** – email/password registration with strict password validation, Google social login, JWT issuance, and MongoDB-backed sessions through the Better Auth MongoDB adapter.
- **Complete book CRUD** – add books with imgbb cover uploads, view full details, edit your own titles in a modal, and delete them behind a custom confirmation modal (never a browser `alert`/`confirm`).
- **Borrow and return workflow** – borrow a book from its details page, track loans in a table with borrow/return dates, return books with one click, and see inventory update automatically.
- **Atomic inventory with `$inc`** – total/available copies are tracked in MongoDB, the Borrow button is disabled when no copies remain, and duplicate active borrows are blocked.
- **Protected routes that survive reloads** – `/add-book`, `/my-books`, `/my-borrows`, `/profile`, and `/books/:id` redirect unauthenticated visitors to `/login` and return them to the page they wanted after signing in.
- **Polished, consistent UI** – sticky navbar with user dropdown, full footer with X/Facebook/Instagram/GitHub links, toast notifications for every success/error, loading spinners, custom 404 page, per-route page titles, and a dark/light theme toggle.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI / icons | lucide-react, Sonner toasts |
| Slider | Swiper.js |
| Authentication | Better Auth + MongoDB adapter + JWT plugin |
| Database | MongoDB (MongoDB Atlas) |
| Image hosting | imgbb |
| Deployment | Vercel (client) + Render (server) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Random 32+ character secret used to sign sessions/JWTs |
| `BETTER_AUTH_URL` | Public URL of this Next.js app (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |
| `NEXT_PUBLIC_API_URL` | Express API base URL (`http://localhost:5000/api/v1` locally) |
| `MONGODB_URI` | MongoDB Atlas connection string (shared with the server) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_IMGBB_API_KEY` | imgbb API key used for cover uploads |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

> The Express API lives in the sibling `server/` folder. Start it separately with `npm run dev` there.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register      # authentication pages
│   ├── (dashboard)/                # private: add-book, my-books, my-borrows, profile
│   ├── (public)/books              # catalog and /books/:id details
│   ├── api/auth/[...all]           # Better Auth handler
│   ├── layout.tsx                  # navbar, footer, theme script, metadata
│   └── not-found.tsx               # custom 404
├── components/                     # navbar, footer, book card, modals, slider
├── lib/                            # auth, auth-client, api-client, mongodb
├── services/                       # book, borrow, image-upload services
└── proxy.ts                        # route protection (Next.js proxy convention)
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Deployment Notes

1. Deploy this `client/` folder to **Vercel**.
2. Deploy the sibling `server/` folder to **Render**.
3. Set all environment variables in both dashboards.
4. In Google Cloud Console, add these authorized redirect URIs:
   - `https://<your-vercel-domain>/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
5. Set `CLIENT_URL` on Render to your Vercel URL, and `NEXT_PUBLIC_API_URL` on Vercel to your Render URL + `/api/v1`.
6. Update the **Live Site** link at the top of this README.

---

© BookNook. Built with Next.js, Better Auth, Express, and MongoDB.
