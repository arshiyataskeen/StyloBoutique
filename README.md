# Stylo Ladies Botique — Website

Public website and admin panel for **Stylo Ladies Botique**, Vijayawada.
Customers browse designs, book a fitting, and track their order. The owner manages
everything from an admin panel — no code changes needed.

**Stack:** Next.js 16 · React 19 · PostgreSQL 16 · Prisma 7 · Tailwind CSS 4 · Docker

---

## What the site does

### Public site
- **Home** — hero background video, shop stats, featured designs, how-it-works, photo gallery
- **Catalog** — designs grouped by category (Blouses, Suits, Bridal Wear, Kids Wear)
- **Book a Fitting** — customer submits a booking and instantly gets a reference code
- **Track Order** — check booking status using the reference code or phone number
- **Contact** — enquiry form

### Admin panel (`/admin`)
- Designs, categories, bookings and customer enquiries — full add/edit/delete
- **Site settings** — logo, hero video, gallery photos, shop address, phone, and all
  homepage text are editable from the UI. Uploaded files go to `public/uploads/`.

---

## Local development

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Start the database
```powershell
docker compose up -d postgres
```
Starts PostgreSQL only, on `localhost:5432`. Leave it running.

### 2. Set up environment
```powershell
Copy-Item .env.example .env.local
```
Then edit `.env.local` and set `ADMIN_KEY` and `JWT_SECRET` to your own long random values.

### 3. Install and run
```powershell
npm install
npm run db:migrate     # create the database tables
npm run seed           # add starter categories and designs
npm run dev            # http://localhost:3000
```

The app runs natively with hot reload — you do **not** need to rebuild Docker to see changes.

---

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the site with hot reload |
| `npm run build` | Production build |
| `npm run lint` | Check code style |
| `npm run db:migrate` | Apply schema changes |
| `npm run db:studio` | Browse/edit the database in a UI |
| `npm run seed` | Seed categories and sample designs |
| `docker compose up -d postgres` | Start the database |
| `docker compose down` | Stop all containers |

Re-apply the brand media and homepage text (logo, hero video, gallery, copy):
```powershell
node --env-file=.env.local -r tsx/cjs scripts/setup-brand.ts
```

---

## Running the full stack in Docker

Builds and runs the app *and* the database together — use this to test the real
production build, not for day-to-day work (each change needs a ~3 minute rebuild).

```powershell
docker compose up -d --build
docker compose logs -f app
docker compose down
```

> Stop `npm run dev` first — both use port 3000.

---

## Admin login

Go to `/admin/login` and enter the value of `ADMIN_KEY` from `.env.local`.

There are no user accounts. Access is a single shared key checked against that
environment variable, which then issues a signed session cookie valid for 12 hours
(`lib/auth.ts`). **Anyone with the key has full access — keep it secret and change
it before going live.**

---

## Project structure

```
project/
├── app/
│   ├── (site)/              # Public pages — home, catalog, book, track, contact
│   ├── admin/               # Admin panel pages
│   ├── api/                 # API routes (public + /api/admin, key-protected)
│   ├── layout.tsx           # Root layout, SEO metadata, Open Graph tags
│   └── icon.png             # Favicon (the orange "S" mark)
├── components/
│   ├── public/              # Website components (Hero, Gallery, Navbar, ...)
│   └── admin/               # Admin forms and uploaders
├── lib/
│   ├── auth.ts              # Admin key check + JWT session
│   ├── prisma.ts            # Database client
│   ├── settings.ts          # Site settings loader
│   └── validators.ts        # Zod input validation
├── prisma/schema.prisma     # Database schema
├── scripts/
│   ├── seed.ts              # Starter categories and designs
│   └── setup-brand.ts       # Apply brand media + homepage copy
├── public/media/            # Brand assets (see below)
├── proxy.ts                 # Protects /admin and /api/admin routes
└── docker-compose.yml       # PostgreSQL + the app
```

### Brand assets (`public/media/`)

```
logo/logo-on-light.png     Dark wordmark — for light backgrounds (navbar, footer)
logo/logo-on-dark.png      Chrome wordmark — for dark backgrounds
hero/background.mp4        Hero background video
gallery/design/            Product photos, no model
gallery/with-model/        Product photos worn by a model
og-image.jpg               Link preview shown when the site is shared on WhatsApp
```

`public/media/` holds hand-placed brand files. `public/uploads/` is for images the
owner uploads through the admin panel — don't mix the two.

---

## Deployment notes

- Set `SITE_URL` to the live domain (e.g. `https://styloladiesbotique.com`) so
  Open Graph/WhatsApp link previews and structured data use real URLs.
- Set strong `ADMIN_KEY` and `JWT_SECRET` values — never reuse the development ones.
- `public/uploads/` must be on persistent storage, or owner-uploaded images are lost
  on redeploy. The Docker setup mounts a named volume for this.
- Database migrations run automatically on container start (`docker-entrypoint.sh`).
