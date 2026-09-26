# Deploying to Vercel

Written for whoever is putting this site live. Follow it top to bottom.

---

## What the deployment is made of

Four pieces. Only the first two cost you anything to set up.

```
   GitHub repo  ──push──▶  Vercel  ──queries──▶  Neon Postgres
   (161 files,              │                    (all your data:
    the source)             │                     designs, bookings,
                            │                     enquiries, feedback,
                            │                     site settings)
                            │
                            ├─▶ CDN: everything in public/
                            │   logo, hero video, photos
                            │
                            └─▶ Serverless functions:
                                every page + every /api route
                                        │
                                        └──▶ Gmail SMTP
                                             booking / enquiry alerts
```

**Vercel** rebuilds and redeploys every time you push to GitHub. There is no
server to restart and nothing to upload by hand.

**Neon** holds all the data. Vercel holds none — a redeploy never touches it, so
your bookings and designs survive every deployment.

**`public/`** is served straight from Vercel's CDN, not from a function. That is
why your logo, hero video and photos are fast, and why they must live in the
repo rather than being uploaded at runtime.

### Build time vs. request time

Knowing which is which explains most deployment failures:

| Phase | What runs | Needs |
|---|---|---|
| **Build** | `npm install` → `postinstall: prisma generate` → `next build` | `DATABASE_URL` — the page metadata is generated from the database, so the build reads it |
| **Every request** | A serverless function renders the page and queries Neon | `DATABASE_URL`, `ADMIN_KEY`, `JWT_SECRET`, `SITE_URL` |

Every page here is `force-dynamic` — rendered per request, never cached — so the
site reflects an admin change the moment you save it.

### What is deliberately *not* deployed

- **Docker and `docker-compose.yml`** — local development only. Vercel does not
  use them. They stay in the repo so you can still run Postgres on your machine.
- **`lib/generated/prisma`** — rebuilt on Vercel by `postinstall`. It is
  gitignored on purpose; committing it would ship a client built for the wrong
  platform.
- **`public/uploads/`** — see the next section.

---

## Before you start: one thing does not work on Vercel

**Uploading photos through the admin panel will fail once deployed.**

`app/api/admin/upload/route.ts` writes files into `public/uploads/`. On your own
machine and in Docker that is a real folder. On Vercel the filesystem is
read-only, and anything written during a request is thrown away when that
request ends — so an uploaded photo either errors or vanishes.

Everything else works: the photos already in `public/media/` are part of the
repo and will serve normally, and every other admin screen (categories,
designs, prices, bookings, feedback, site content) is database-backed and fine.

You have three options:

1. **Deploy now, add photos later.** The site is fully usable; you just cannot
   add a *new* photo from the admin panel yet. Good if you want it live today.
2. **Put new photos in `public/media/` yourself** and push to GitHub. Works, but
   needs a redeploy for each batch.
3. **Switch uploads to Vercel Blob** — the proper fix, about an hour of work.
   Ask and it can be done before you deploy.

---

## Step 1 — Get a hosted database

Docker Postgres only exists on your machine. Vercel needs a database on the
internet. Any Postgres works; **Neon** has a free tier and suits this well.

1. Go to your Vercel dashboard → **Storage** → **Create Database** → **Neon
   (Postgres)**.
2. Once created, open it and copy the connection string. Take the one labelled
   **pooled** / containing `-pooler`.

> **Take the pooled string, not the direct one.** Every page here is
> server-rendered, so each visitor request opens a database connection. Without
> pooling a busy moment exhausts the connection limit and pages start failing.

Keep both strings to hand — you need the direct one once, in step 4.

## Step 2 — Push to GitHub

Already cleaned up for you. `.gitignore` correctly excludes `node_modules`,
`.next`, `.env.local` and the generated Prisma client.

Confirm your secrets are **not** about to be committed:

```bash
git status --porcelain | findstr ".env.local"
```

That must print nothing. Then push as normal.

## Step 3 — Import into Vercel

1. Vercel dashboard → **Add New** → **Project** → pick the GitHub repo.
2. Framework preset: **Next.js** (it will detect this).
3. Leave the build and output settings alone — the defaults are right.
4. **Do not deploy yet.** Add the environment variables first (step 4),
   otherwise the first build fails and you just have to redo it.

## Step 4 — Environment variables

In **Settings → Environment Variables**, add these for *Production* (and
*Preview*, if you want preview deployments to work):

| Variable | Value |
|---|---|
| `DATABASE_URL` | The **pooled** connection string from step 1 |
| `ADMIN_KEY` | A long random secret — this is the admin panel password |
| `JWT_SECRET` | A **different** long random secret |
| `SITE_URL` | `https://your-project.vercel.app` (update after you add a domain) |
**Leave the SMTP variables out.** Email alerts are configured in the admin
panel instead — **Admin → Site Content → Email alerts** — and what is saved
there takes priority over any env var. The host and port default to Gmail's in
code, and the recipient address has no env var at all, so setting them here
would not switch alerts on anyway. See step 7.

To generate the two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Run it twice. **Change `ADMIN_KEY` from whatever is in your `.env.local`** —
that value has been in a chat log and on your screen, so treat it as burned.

## Step 5 — Create the tables

The database from step 1 is empty. Run the migrations against it **once**, from
your own machine, using the **direct** (non-pooled) connection string:

```powershell
$env:DATABASE_URL = "postgresql://...direct connection string..."
npx prisma migrate deploy
```

`migrate deploy` only applies existing migrations — it never invents or drops
anything, so it is safe to run against a real database.

> Use the direct string here, not the pooled one. Schema changes do not work
> reliably through a connection pooler.

## Step 6 — Deploy

Hit **Deploy**. The build runs `prisma generate` automatically via the
`postinstall` script, then `next build`.

If the build fails with *"Cannot find module '@/lib/generated/prisma/client'"*,
the `postinstall` script is missing from `package.json` — it must be there.

## Step 7 — Set the site up

1. Open `https://your-project.vercel.app/admin/login` and sign in with your
   `ADMIN_KEY`.
2. The site starts empty. Add your categories and designs, or run the seed
   script against the production database from your machine:

   ```powershell
   $env:DATABASE_URL = "postgresql://...direct connection string..."
   npm run seed
   ```

3. In **Admin → Site Content**, set the Instagram handle.

4. Still in Site Content, open **Email alerts** and fill in all three:
   **Send alerts to** (where bookings and enquiries are emailed), **Send from**
   (your Gmail address) and the **Gmail App Password** — Google Account →
   Security → 2-Step Verification → App passwords, not your login password.
   Save, then hit **Send test email**; it reports success or the exact failure.

   Alerts stay off until "Send alerts to" has a value, whatever else is set.

## Step 8 — Your own domain

1. Vercel → **Settings → Domains** → add it, and follow the DNS instructions.
2. Update `SITE_URL` to the real domain and redeploy, so WhatsApp and Facebook
   link previews and the Google listing point at the right place.

---

## If something goes wrong

**Build fails on Prisma** — check `postinstall: prisma generate` is in
`package.json`.

**Pages load but data is missing** — the app is talking to a database with no
tables. Re-run step 5 and check `DATABASE_URL` in Vercel matches the database
you migrated.

**Intermittent "too many connections"** — you used the direct connection string
in Vercel instead of the pooled one. Swap it in `DATABASE_URL` and redeploy.

**Admin login rejects the key** — `ADMIN_KEY` in Vercel does not match what you
are typing. Environment variable changes need a redeploy to take effect.

**Photo upload errors** — expected; see the note at the top.
