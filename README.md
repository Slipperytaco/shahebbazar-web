# shahebbazar-web

COS40005 — Group 23 · Shaheb Bazar

A local business directory and B2B/B2C discovery platform for Rajshahi,
Bangladesh. Express API + Next.js frontend + PostgreSQL.

---

## Architecture

```
                          ┌─ /        ──:3000──> Next.js (SSR frontend)
Browser ──HTTPS:443──> Caddy                          │  server-side fetch
                          └─ /api/*   ──:4000──> Express API ──:5432──> PostgreSQL
```

Two processes behind one origin. The Next pages fetch from Express **on the
server**, never in `useEffect` — that is what makes shop pages crawlable,
which the client requires. A page that fetches in the browser sends
Googlebot an empty div.

| Path | What it is |
| --- | --- |
| `backend/` | Express API, port 4000 |
| `frontend/shahebbazar/` | Next.js 16 + TypeScript + Tailwind 4 |
| `database/` | Schema and seed SQL |

### Three role areas

The frontend is split by the three roles in the client's RBAC requirement.
Each is a **route group** — a folder in parentheses organises files without
adding a URL segment — so grouping never shows up in a URL.

```
app/
  layout.tsx              <html>, fonts, site-wide metadata
  (public)/               BROWSING — readable signed out, crawlable
    page.tsx                /
    vendors/register/       /vendors/register
  (seeker)/               CUSTOMER — signed in, role 'customer'
    layout.tsx              auth gate
    account/                /account
  (provider)/             SHOP OWNER — signed in, role 'vendor'
    layout.tsx              auth gate
    vendors/dashboard/      /vendors/dashboard
  (admin)/                PLATFORM ADMIN — signed in, role 'admin'
    layout.tsx              stricter gate
    admin/                  /admin

components/
  shared/     used by more than one area (header, footer, business card, icons)
  public/     browsing surface
  seeker/     customer account
  provider/   shop-owner side
  admin/      admin side
```

Four folders for three roles, because the **seeker has two halves** and
they need different gates:

- `(public)` is the seeker browsing — search, categories, shop profiles.
  It must stay readable signed out; these are the pages the client needs
  Google to crawl.
- `(seeker)` is the same person signed in — saved shops, quote requests
  they sent, messages, their own reviews, settings.

Splitting on the gate rather than on the person is what keeps shop pages
indexable while still giving the customer a private area.

Two things this buys:

- **Public URLs stay clean.** The home page is `/`, a shop will be
  `/business/<slug>` — not `/customer/business/<slug>`. The client requires
  shop pages to be crawlable, and a `/customer` prefix would make every
  indexed URL longer for no benefit.
- **One gate per area.** The auth check lives in the group's `layout.tsx`,
  so every page in the folder is protected by default and nobody has to
  remember to add a check to a new screen. Both gates are `TODO(auth)`
  right now — they redirect nothing until sessions exist, which is fine
  while there is no real data behind them and **must not ship**.

Registration sits in `(public)` on purpose: you are not a vendor yet when
you sign up, so it must be outside the provider gate.

**Ownership.** `(admin)` and `components/admin/` are the admin work.
`(public)`, `(provider)` and their component folders are the customer and
shop-owner work. Keep new files in the folder for their role — that is the
whole point of the split.

---

## Setup

### 1. Install

- git, VS Code
- Node.js 24.x — https://nodejs.org/en/download
- Docker Desktop — https://www.docker.com/products/docker-desktop/

Docker runs PostgreSQL for you; there is nothing to install and configure
by hand, and no Administrator rights are needed. `docker-compose.yml` at
the repo root defines it.

pgAdmin is optional — it is a GUI client, useful for browsing tables and
for generating the ER diagram. If you want it, install it on its own
(https://www.pgadmin.org/download/), not via the PostgreSQL installer.

<details>
<summary>Using your own PostgreSQL install instead</summary>

Install PostgreSQL 15+ and skip step 4's `docker compose up`. Set
`PGUSER`, `PGPASSWORD` and `PGPORT` in `backend/.env` to match your
install, then run `npm run db:load` as normal. Everything else is
identical — the app does not care where Postgres runs.
</details>

### 2. Install dependencies

From the repo root, once:

```bash
npm install       # the scripts that run both apps together
npm run setup     # installs backend/ and frontend/shahebbazar/
```

### 3. Configure

```bash
cp backend/.env.example backend/.env
cp frontend/shahebbazar/.env.example frontend/shahebbazar/.env.local
```

The defaults in `.env.example` already match `docker-compose.yml`, so if
you are using Docker there is nothing to edit. Change `PGUSER`,
`PGPASSWORD` and `PGPORT` only if you are pointing at your own PostgreSQL
install.

### 4. Start the database and load it

From the repo root:

```bash
docker compose up -d --wait   # starts PostgreSQL, waits until it is ready
npm run db:load               # creates the schema and seeds it
```

`--wait` blocks until the container reports healthy, so `db:load` cannot
run against a database that is still starting up.

`db:load` applies all six SQL files in the right order and prints a row
count so you know it worked:

```
  businesses         13
  listings           40
  categories         42
  events              4
  moderation queue    3
```

To wipe and start over: `npm run db:reset` (it asks first).

#### Everyday Docker commands

| Command | What it does |
| --- | --- |
| `docker compose up -d` | Start the database |
| `docker compose ps` | Check it is running and healthy |
| `docker compose logs -f db` | Tail the PostgreSQL log |
| `docker compose stop` | Stop it, keep the data |
| `docker compose down` | Remove the container — **data survives** |
| `docker compose down -v` | Remove it **and delete the data**; follow with `npm run db:load` |

The only destructive one is `down -v`. The `-v` removes the named volume.

#### Connecting pgAdmin

Register a server with host `localhost`, port `5432`, database
`shahebbazar`, username `postgres`, password `postgres` — the values in
`docker-compose.yml`.

#### If port 5432 is already taken

Usually because you have a system-wide PostgreSQL. Put `DB_PORT=5433` in a
`.env` file next to `docker-compose.yml`, set `PGPORT=5433` in
`backend/.env`, and `docker compose up -d` again.

#### Loading by hand instead

`npm run db:load` is the supported path. If you would rather run the SQL
yourself in pgAdmin, run these **in order**:

| Order | File | What it does |
| --- | --- | --- |
| 1 | `database/schema.v2.sql` | Core schema — 18 tables, 3 views |
| 2 | `database/schema.v2.1.sql` | Opening hours, events, saved businesses |
| 3 | `database/seed.v2.sql` | B2B sample merchants, categories, RFQs |
| 4 | `database/seed.v2.1.sql` | Consumer directory content for the home page |
| 5 | `database/schema.v2.2.sql` | Website field and `vendor_facts` for the profile page |
| 6 | `database/seed.v2.2.sql` | Profile detail: services, facts, written reviews |

`database/SCHEMA-NOTES.md` explains what changed from the original
`schema.sql` and why, mapped to the client's scope email. The old
`schema.sql` and `sampleinput.sql` are superseded — do not run them.

### 5. Run it

```bash
npm run dev
```

One command, both servers, colour-coded output:

```
[api] API running on http://localhost:4000
[web] ✓ Ready in 4.5s   http://localhost:3000
```

Open **http://localhost:3000** — and `?lang=bn` for Bangla.
Ctrl-C stops both.

---

## Scripts

All from the repo root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Both servers, with reload on change |
| `npm run dev:api` / `npm run dev:web` | Just one of them |
| `npm run db:load` | Create the database if needed and load schema + seed |
| `npm run db:reset` | Drop it, recreate, reload. Asks first. |
| `npm run build` | Production build of the frontend |
| `npm start` | Both servers in production mode (needs `build` first) |
| `npm run lint` / `npm run typecheck` | Frontend checks |
| `npm run setup` | Install dependencies in both sub-projects |

Each sub-project still works on its own — `cd backend && npm run dev`, or
`cd frontend/shahebbazar && npm run dev` — if you prefer separate terminals.

---

## Environment variables

`backend/.env`

| Variable | Purpose |
| --- | --- |
| `PGHOST` `PGUSER` `PGPASSWORD` `PGDATABASE` `PGPORT` | Postgres connection |
| `PORT` | API port, default 4000 |
| `CORS_ORIGIN` | Comma-separated allowed browser origins. Never a wildcard once sessions exist. |

`frontend/shahebbazar/.env.local`

| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Where the **Next server** reaches Express. In Docker this is the service name. |
| `NEXT_PUBLIC_ASSET_BASE_URL` | Base URL the browser uses for uploaded images. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL. Used for canonical links and OpenGraph cards — leaving this as localhost in production breaks every share preview. |

---

## API

Public, read-only. Everything returns approved rows only.

| Method | Route | Returns |
| --- | --- | --- |
| GET | `/api/health` | Liveness plus whether the database is reachable |
| GET | `/api/home` | `{ categories, featured, events, popularSearches }` |
| GET | `/api/categories` | Full category tree |
| GET | `/api/businesses` | `{ results, sponsored, total, limit, offset, sort, facets }` — filters: `q`, `category`, `area`, `sort`, `limit`, `offset`. `facets` carries area and category counts for the sidebar. |
| GET | `/api/businesses/:slug` | One profile: business, categories, opening hours, photos, services, facts, reviews, rating distribution and nearby similar shops. 404 for an unknown or unapproved shop. |

Vendor routes (`/api/vendors`, `/api/vendors/:id/listings`, …) still use the
original column names and need the updates listed in `SCHEMA-NOTES.md` §4.

**Sponsored results are returned in their own array**, never mixed into
`results`. Paid placement has to render with a visible label.

---

## Conventions

Database:

- table names → `snake_case` plural
- column names → table-prefixed `snake_case`
- foreign keys → `<table>_id`

Examples: `vendor_id`, `category_id`, `user_email`, `vendor_created_at`

Frontend:

- Pages are **server components**. Add `"use client"` only for something
  that genuinely needs browser state, and never for data fetching.
- Shared response shapes live in `frontend/shahebbazar/lib/types.ts`. Change
  a column in Express, change it there in the same commit.
- Copy goes in `lib/i18n.ts`, both languages. No hardcoded English in JSX.

**Styling — Tailwind utilities only.** Design tokens are declared in the
`@theme` block of `app/globals.css`, which generates the utilities:
`bg-brand-600`, `text-muted`, `border-line`, `bg-surface`, `shadow-card`,
`bg-open-bg`, and so on. Use those instead of raw hex, and instead of
writing new CSS classes. The only hand-written CSS left is a `@layer
components` shim for the legacy `.form-*` classes on the vendor pages;
delete it when those are rebuilt.

Two Tailwind traps worth knowing:

- Class names must appear **complete** in the source. Tailwind scans text,
  so `` `bg-${colour}-50` `` is never generated. Write the full strings out
  (see `TINTS` in `CategoryGrid.tsx`).
- Plain CSS outside `@layer` **beats** utility classes. A `padding`
  shorthand in an unlayered rule silently overrode `pl-11` and pushed the
  search text under its own icon. Keep component CSS inside
  `@layer components`.

**Icons — two libraries, deliberately.**

| Library | Use for |
| --- | --- |
| `lucide-react` | All UI icons. Import the component directly: `import { Search } from "lucide-react"`. Tree-shaken, so only what you import ships. |
| `@icons-pack/react-simple-icons` | Brand marks only (Facebook, Instagram, YouTube, WhatsApp). Lucide removed these — brand logos carry trademark terms an icon set cannot grant. |

Size them with Tailwind: `className="size-4"`. `components/icons.ts` exists
only for `categories.category_icon`, which is a string in the database and
so has to be resolved at runtime. Everything else imports directly.

Hand-drawn SVG is still right for **artwork** — the hero panel and the
"Explore Rajshahi" skyline are illustrations, not icons, and stay inline.

Branches:

```
main            protected, production-ready
dev             shared development
feature/<task>  individual work
```

---

## Troubleshooting

**Check `http://localhost:4000/api/health` first.** It reports the
connection and the schema separately, and tells you what to run:

```json
{ "ok": false, "db": true,
  "schema": { "ok": false,
              "missing": [ { "name": "v_business_cards", "file": "schema.v2.1.sql" } ] },
  "hint": "The database is reachable but incomplete. … Run `npm run db:load`" }
```

| Symptom | Cause and fix |
| --- | --- |
| `API /api/home responded 500` in the browser | The frontend is reporting a *backend* failure, so the cause is in the `[api]` terminal, not the Next one. Almost always a partly loaded database — `schema.v2.sql` ran but `schema.v2.1.sql` did not, so `v_business_cards` and `events` are missing. Fix: `npm run db:load`. The API also prints the missing objects at startup, and `/api/home` returns the real reason in `detail` outside production. |
| Home page renders but is empty | Backend down, or it cannot reach the database. `getHomeData` degrades to an empty shell rather than crashing the page, so the header, search and footer still render. Check `/api/health`. |
| Data changed but the page did not | `/api/home` is cached for 5 minutes. Delete `frontend/shahebbazar/.next` and restart. |
| `EADDRINUSE`, or stale answers from the API | An old server still holds the port. On Windows a leftover `node.exe` keeps listening after its terminal is gone, and a second server can bind the same port *without erroring* — so you end up talking to the dead one and wondering why your change did nothing. Fix: `npx kill-port 4000` (or `3000`), then start again. |
| `ECONNREFUSED` from the API, or `PostgreSQL is not accepting connections` from `db:load` | The database container is not running. `docker compose up -d` from the repo root. Check with `docker compose ps`. |
| `password authentication failed` | `PGPASSWORD` in `backend/.env` does not match `docker-compose.yml`. |
| `database "shahebbazar" does not exist` | `npm run db:load` creates it. |

## Known gaps

Tracked so nobody rediscovers them:

- **Auth does not exist yet.** `users`, `otp_codes` and `sessions` are in the
  schema; nothing writes to them. RBAC, RFQ, messaging and admin all wait on
  this.
- The vendor register/dashboard pages are the original client-side ones and
  still post the old column names.
- Language is `?lang=bn`, which opts pages out of static generation. Crawling
  is unaffected. Locale-prefixed routes (`/en`, `/bn`) are the fix before
  launch.
- Categories, deals, events and blog pages are linked in the navigation but
  not built, so those nav items 404.
- Maps are drawn SVG sketches, not real maps — a live map needs an API key
  the client has not provided. Swap in Leaflet with OpenStreetMap tiles
  (no key required) when maps become scope.
- `/api/home` responses are cached for 5 minutes. After changing seed data,
  restart the frontend or delete `frontend/shahebbazar/.next` — otherwise
  you will debug a stale payload.
