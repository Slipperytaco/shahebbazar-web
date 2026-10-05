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
- **One intended gate per private area.** The customer, provider and admin
  route groups each have a layout intended to enforce authentication and
  role access. These frontend gates are currently incomplete and must not
  be treated as security controls until they are connected to the
  server-side session workflow.

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

The real backend `.env` file is not stored in Git. A safe template is provided at:

```text
backend/.env.example
```

#### Windows PowerShell

Run this command in PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

#### macOS / Linux / Git Bash

Run this command in the terminal:

```bash
cp backend/.env.example backend/.env
```

Then open:

```text
backend/.env
```

If you are using the Docker setup provided with this project, the default values in `.env.example` should already match `docker-compose.yml`.

If you are using your own PostgreSQL installation, update the following values in `backend/.env` to match your local setup:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=shahebbazar
PGUSER=postgres
PGPASSWORD=YOUR_POSTGRES_PASSWORD

PORT=4000
ANALYTICS_SALT=shahebbazar-local-dev
CORS_ORIGIN=http://localhost:3000
 
# Phase 1 mock phone verification
MOCK_VERIFICATION_DELIVERY=console
OTP_HASH_SECRET=GENERATE_A_UNIQUE_LOCAL_SECRET
```

Replace:

```env
PGPASSWORD=YOUR_POSTGRES_PASSWORD
```

with your actual local PostgreSQL password.

Do not commit `backend/.env` to Git.

Only the safe template file:

```text
backend/.env.example
```

should be committed to the repository.

Generate a local OTP hashing secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `OTP_HASH_SECRET` in `backend/.env`.

Do not commit the generated secret or the real `backend/.env` file.


### 4. Start the database and load it

From the repo root:

```bash
docker compose up -d --wait   # starts PostgreSQL, waits until it is ready
npm run db:load               # creates the schema and seeds it
```

`--wait` blocks until the container reports healthy, so `db:load` cannot
run against a database that is still starting up.

`db:load` applies the current schema and seed files in the required order and prints a row count so you know it worked:

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

#### Loading the database manually

The recommended method is:

```bash
npm run db:load
```

This automatically applies the database schema and seed files required by the current version of the project.

If you prefer to load SQL files manually using pgAdmin, check the current files inside:

```text
database/
```

and follow the order used by the project's database loading script.

Because the database schema is updated during development, do not rely on an old hard-coded list of schema versions in this README.

For details about database structure and schema changes, refer to:

```text
database/SCHEMA-NOTES.md
```

The older files:

```text
database/schema.sql
database/sampleinput.sql
```

are superseded and should not be used for the current database setup.

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

The local backend environment file is:

```text
backend/.env
```

Create it from the provided template:

### Windows PowerShell

```powershell
Copy-Item backend\.env.example backend\.env
```

### macOS / Linux / Git Bash

```bash
cp backend/.env.example backend/.env
```

The main backend environment variables are:

| Variable | Purpose |
| --- | --- |
| `PGHOST` | PostgreSQL host, normally `localhost` |
| `PGPORT` | PostgreSQL port, normally `5432` |
| `PGDATABASE` | PostgreSQL database name, normally `shahebbazar` |
| `PGUSER` | PostgreSQL username |
| `PGPASSWORD` | PostgreSQL password |
| `PORT` | Backend API port, default `4000` |
| `ANALYTICS_SALT` | Salt used for analytics visitor hashing |
| `CORS_ORIGIN` | Comma-separated browser origins permitted to call the API |
| `MOCK_VERIFICATION_DELIVERY` | Development verification delivery; use `console` for the Phase 1 mock |
| `OTP_HASH_SECRET` | Private server secret used to hash verification codes |

Example:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=shahebbazar
PGUSER=postgres
PGPASSWORD=YOUR_POSTGRES_PASSWORD

PORT=4000
ANALYTICS_SALT=shahebbazar-local-dev
CORS_ORIGIN=http://localhost:3000

# Phase 1 mock phone verification
MOCK_VERIFICATION_DELIVERY=console
OTP_HASH_SECRET=GENERATE_A_UNIQUE_LOCAL_SECRET
```

Generate a unique local OTP hashing secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `OTP_HASH_SECRET` in `backend/.env`.

Do not commit:

- `backend/.env`
- The generated `OTP_HASH_SECRET`
- Raw verification codes
- Session tokens

The repository should contain only the safe template:

```text
backend/.env.example
```

---
## Phase 1 phone verification

Phone number is the primary account identifier. Live SMS delivery is
deferred for Phase 1 due to provider costs, so the development environment
uses a client-approved mock delivery method.

The current verification-request flow is:

```text
Client submits phone number and purpose
        ↓
Backend normalises and validates the phone number
        ↓
Backend generates a six-digit verification code
        ↓
Backend stores only an HMAC-SHA256 hash of the code
        ↓
Code expires after five minutes
        ↓
Mock delivery prints the code in the local API terminal
```

The raw code is not stored in PostgreSQL and is not returned in the API
response.

### Request a mock verification code

```http
POST /api/auth/request-verification
Content-Type: application/json
```

Example request:

```json
{
  "phone": "+8801700000100",
  "purpose": "login"
}
```

Supported purposes:

```text
login
register
recover
verify
```

Successful response:

```json
{
  "success": true,
  "message": "A verification code has been generated."
}
```

Development-only terminal output:

```text
[mock verification] phone: <normalised phone>
[mock verification] purpose: <purpose>
[mock verification] code: <six-digit code>
```

Do not include mock codes in commits, screenshots, Jira evidence or
documentation.

The endpoint currently includes:

- Bangladesh phone-number normalisation
- Phone-format validation
- Verification-purpose validation
- Secure six-digit code generation
- HMAC-SHA256 code hashing
- Five-minute expiry
- Request limiting by phone number and purpose
- Request-IP recording
- Console-only mock delivery outside production

The current development policy permits three matching requests for the
same phone number and verification purpose within ten minutes. A fourth
request during that window returns HTTP `429 Too Many Requests`.

Code confirmation, code consumption, session creation, registration,
login, logout and full protected-route integration are still in progress.

---
## API

The API contains public discovery endpoints and account, vendor and
administrative endpoints. Public discovery endpoints return approved
records only. Authentication and RBAC integration for private endpoints
is currently in progress.

| Method | Route | Returns |
| --- | --- | --- |
| GET | `/api/health` | API, database and schema health |
| GET | `/api/home` | `{ categories, featured, events, popularSearches }` |
| GET | `/api/categories` | Full category tree |
| GET | `/api/businesses` | Search results, sponsored results, pagination and facets |
| GET | `/api/businesses/:slug` | Approved business profile, opening hours, photos, services, reviews and ratings |
| GET | `/api/auth/me` | Safe account details for the authenticated user; returns `401` without a valid session |
| POST | `/api/auth/request-verification` | Generates and stores a hashed mock verification code; the raw code appears only in the local API terminal |

**Sponsored results are returned in their own array**, never mixed into
`results`. Paid placement must render with a visible label.

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
develop         shared development
feature/<task>  individual work
```

---

## Troubleshooting
**Check http://localhost:4000/api/health first.** It reports the
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
| Verification request returns `500` and the API reports that `OTP_HASH_SECRET` is not configured | Generate an `OTP_HASH_SECRET`, add it to `backend/.env`, then restart the API. |
| Verification succeeds but no code appears in the API terminal | Confirm `MOCK_VERIFICATION_DELIVERY=console`, ensure `NODE_ENV` is not `production`, then restart the API. |
| Verification request returns `429` | Three matching requests already exist for that phone number and purpose within ten minutes. Wait for the window to pass or use another synthetic test number. |
| `Cannot POST /api/auth/request-verification` | Confirm `authRouter` is mounted at `/api/auth` in `backend/index.js`, save the file and restart the API. |
| `/api/auth/me` returns `401` | This is expected when no valid session cookie exists. Session issuance is not yet implemented. |

## Known gaps

Tracked so nobody rediscovers them:
- **Authentication and RBAC are in progress.** Backend middleware can read
  a session cookie, hash its token, resolve an active unexpired session,
  load the active user and enforce authentication, roles and vendor
  ownership. Anonymous `/api/auth/me` requests correctly return `401`.
  Code confirmation, session issuance, logout, customer registration and
  migration of existing private routes away from seeded identity helpers
  remain outstanding.

- **Live SMS delivery is deferred for Phase 1.** Development currently uses
  a client-approved console mock. Verification-code generation, hashing,
  expiry, request limiting and database storage are implemented. Only the
  delivery step is mocked.

- **Business registration needs final authentication integration.** The
  current flow creates linked `users` and `vendors` records and stores the
  NID reference with a pending status. The page still needs clearer
  business-specific wording and must be connected to phone verification
  and session creation.

- **The vendor dashboard requires a separate schema and ownership audit.**
  Successful business registration does not confirm that every dashboard
  mutation is current or adequately protected.

- **Frontend private route groups are not fully protected.** The customer,
  provider and admin layouts still require integration with the
  server-side session and RBAC workflow.

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
