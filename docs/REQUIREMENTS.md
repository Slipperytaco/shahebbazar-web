# Client requirements — what is built, what is not

Source of truth: **"Scope Confirmation & Project Execution Guidelines"**,
Ishtiak Ahmad Anan, 4 September 2026. Screenshots in `finalized_images/`.

The six approved screen designs are in `UIs/` — that is *how it looks*.
This file tracks *what it does*.

**Last checked:** 5 September 2026 (search + profile built).

Status is one of:

| | |
| --- | --- |
| **Done** | Built and verified running |
| **Schema only** | Tables exist and are seeded; no API or UI |
| **Partial** | Some of it works, the rest is named below |
| **Not started** | Nothing exists |

---

## 1. Phase 1 versus Phase 2

The client split the project. Anything marked Phase 2 must **not** be built
now — the most expensive mistake available here is building a payment
gateway that was explicitly postponed.

| Area | Phase 1 — build now | Status | Phase 2 — do not build |
| --- | --- | --- | --- |
| Monetization | RFQ system, product inquiry buttons, offline / cash-on-delivery terms | **Schema only** | bKash, Nagad, SSLCommerz checkout |
| Marketing | Dynamic OpenGraph tags, SEO preview cards, social share buttons | **Partial** | Facebook Ads Management API |
| Lead routing | Direct business↔customer messaging, inquiry submissions, dashboard alerts | **Schema only** | Algorithmic lead matching |

RFQ detail: `quote_requests` and `quote_responses` exist, are seeded with
three requests in different states, and `quote_payment_terms` defaults to
`cash_on_delivery`. No endpoints, no screens.

Marketing detail: OpenGraph tags are done site-wide, on the home page and
per shop (title, description and the shop's cover image), with
`metadataBase` set so share cards resolve. A WhatsApp share button is on
every profile — chosen over the Web Share API because it has to work
without JavaScript, and WhatsApp is how a link actually travels here.

---

## 2. Core project requirements

### 2A. User and authentication architecture

| Requirement | Status | Where |
| --- | --- | --- |
| RBAC — three roles: Customer, Vendor/Business Owner, Platform Admin | **Partial** | `users.user_role` with a CHECK constraint. Route areas exist per role — `app/(seeker)`, `app/(provider)`, `app/(admin)` — but **every gate is a `TODO(auth)` that lets anyone through.** |
| Phone-based auth as primary identifier, via OTP/SMS | **Schema only** | `users.user_phone` NOT NULL UNIQUE, `otp_codes` (hashed codes, expiry, attempt count), `sessions` (hashed tokens). No endpoints. |
| Email kept optional | **Done** | `users.user_email` is nullable. |

> **This is the critical path.** RFQ, messaging, the admin portal and the
> seeker account are all blocked on it. It is also the one piece that must
> not ship in its current state: the role gates are written but inert.

Still live: `backend/routes/vendors.js` inserts a plain-text
`vendor_password`. The column no longer exists, so **vendor registration
currently fails outright**. Fix with auth.

### 2B. Design and UI/UX standards

| Requirement | Status | Where |
| --- | --- | --- |
| Independent brand identity — do not clone Facebook's layout or blue | **Done** | The old `layout.tsx` used `#1877F2` and `#F0F2F5`, Facebook's exact palette. Replaced with brand tokens on `#2563EB` in the `@theme` block of `app/globals.css`. |
| Mobile-first, responsive, fast loads, card-based results | **Partial** | Home page verified at 390px — single column, side rail dropped. Other pages do not exist yet. |

### 2C. SEO and discovery architecture

| Requirement | Status | Where |
| --- | --- | --- |
| Listings crawlable — SSR or dynamic pre-rendering | **Done for the public site** | Home, search and shop profiles are all server components; verified that names, services, hours and reviews are in the raw HTML before any JavaScript runs. The teammate's vendor pages are still client-side. |
| JSON-LD structured data (LocalBusiness, Product) | **Partial** | `WebSite` + `SearchAction` on the home page; `LocalBusiness` on every shop profile, with address, geo, aggregateRating and openingHoursSpecification. `Product` on individual listings is still to do. |

Slugs are in the schema for every public entity (`vendor_slug`,
`listing_slug`, `category_slug`, `location_slug`), so crawlable URLs are
ready when the pages are.

### 2D. Messaging and inquiries

| Requirement | Status | Where |
| --- | --- | --- |
| Lightweight buyer↔seller messaging | **Schema only** | `conversations`, `messages`. |
| SMS or email alert when the seller is offline | **Schema only** | `notifications` is an outbox — a row is written first and dispatched by a worker, so a failed SMS is retryable rather than a lost enquiry. No worker, no SMS driver. |

### 2E. Administrative portal

Owned by the teammate building admin. `app/(admin)/` marks the boundary.

| Requirement | Status | Where |
| --- | --- | --- |
| Approve and verify new business listings | **Schema only** | `vendors.vendor_status`, `vendor_listings.listing_status`, `v_moderation_queue` (one list across vendors, listings and reports — seeded with 3 pending items). |
| Moderate inappropriate reviews and fake profiles | **Schema only** | `reviews.review_status`, `reports` (polymorphic), `audit_logs`. |
| Daily/weekly search trends and active user counts | **Schema only** | `v_search_trends_daily` — buckets under 5 events are suppressed, because one district plus one rare medical query is re-identifiable and the client asked for no personal data exposed. `v_active_users_daily`. |

---

## 3. Required deliverables

| # | Deliverable | Status | Notes |
| --- | --- | --- | --- |
| 1 | Clean codebase, modular, env setup guide, comprehensive README | **Done** | `README.md` covers setup, env vars, scripts, API, conventions and known gaps. Structured Git repo is **outstanding — this folder is not a git repository.** |
| 2 | Documented schema, FK constraints, **ER diagram**, seed with sample Rajshahi merchants | **Partial** | Schema, constraints and seed done and verified loading; `SCHEMA-NOTES.md` maps each change to a client line. **No ER diagram** — generate from pgAdmin's ERD tool or dbdiagram.io. |
| 3 | **API documentation** — Swagger/OpenAPI or a shared Postman collection | **Not started** | Four public endpoints exist and are tabled in the README, but that is not the deliverable he asked for. |
| 4 | Working deployed prototype demonstrating search, shop profile, quotation and admin verification | **Not started** | None of those four flows has a screen yet, and nothing is deployed. |

### Also asked for, and outstanding

> "Please update the technical specification document according to these
> guidelines and share a revised milestone schedule for Phase 1."

**Nobody has sent this.** It is the cheapest item on the list and the most
visible if skipped.

---

## Screens: designed versus built

| Screen | Design | Built |
| --- | --- | --- |
| Home page | `UIs/…18.25.26 (4).jpeg` | **Done** |
| Search results | `UIs/…18.25.26 (5).jpeg` | **Done** |
| Business profile | `UIs/…18.25.26 (6).jpeg` | **Done** |
| Provider registration | `UIs/…18.25.26 (7).jpeg` | Not started — old client-side form still in place, and broken |
| Provider dashboard | `UIs/…18.25.27 (2).jpeg` | Not started — old client-side page still in place |
| Add / edit business | `UIs/…18.25.27 (3).jpeg` | Not started |
| Customer account | **no design** | Placeholder at `/account` |
| Admin portal | **no design** | Placeholder at `/admin` |

Two areas have no approved design: the customer account and the admin
portal. Worth asking the client for those rather than inventing them.

---

## Two deviations to confirm with the client

1. **Featured businesses are labelled "Sponsored"; the design has no such
   label.** They are paid placements. Labelling is the defensible default,
   and disguising paid placement is a real problem under the ACS code. One
   line in `components/public/FeaturedBusinesses.tsx` if the team prefers
   exact design fidelity.

2. **The scope email and the designs name different categories.** The email
   says silk, handicrafts, agro-supplies, light manufacturing; the designs
   show Medical, Tourism, Restaurants, Shopping, Education, Services. Both
   are seeded — consumer categories own the six home tiles, B2B sits behind
   them — on the basis that he calls the platform B2B/B2C. Worth confirming
   rather than guessing.
