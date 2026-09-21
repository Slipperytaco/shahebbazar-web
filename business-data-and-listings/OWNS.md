# janul — Business data · Products & services

## Files you own

| File | What it is |
| --- | --- |
| `database/schema.v2.2.sql` | The current schema. The `.v2` and `.v2.1` files are earlier revisions kept for history — build on `v2.2`. |
| `database/seed.v2.2.sql` | Matching seed data. |
| `database/schema.sql`, `database/sampleinput.sql` | The original first-pass schema and sample rows. Superseded, kept for reference. |
| `database/SCHEMA-NOTES.md` | Why the tables are shaped the way they are. Read before changing anything. |
| `backend/routes/vendorListings.js` | Products & services: create, list and delete listings, plus photo upload via multer. |
| `backend/uploads/*.jpg` | Uploaded listing photos, served at `/uploads`. |
| `app/(provider)/vendors/dashboard/page.jsx` | The provider dashboard shell. |
| `app/(provider)/vendors/dashboard/VendorListings.jsx` | The listing table on that dashboard. |
| `app/(provider)/vendors/dashboard/add-listing/page.jsx` | The add-a-listing form. |

## Where your area starts and stops

You own the data and the write path: the tables, and everything that creates
or edits a business, a product or a service.

You do **not** own the read path. `backend/routes/public.js` — which reads
your tables and serves them to the public pages — is dilru's. If you change a
column those endpoints select, tell dilru before you push.

## What is left to do

1. **Business profile editing.** A provider can add listings but cannot yet
   edit the business itself — hours, contact details, description, photos.
2. **`vendor_opening_hours`.** The table drives the "open now" badge on every
   card. There is no UI to set it.
3. **Listing edit.** Create and delete exist; update does not.
4. **Categories.** Listings need to attach to the category taxonomy the
   directory searches on.

## One thing to watch

The dashboard pages are `.jsx`, while everything newer is `.tsx`. They predate
the TypeScript setup. Converting them is worthwhile but is a separate commit
from any behaviour change — do not mix the two.
