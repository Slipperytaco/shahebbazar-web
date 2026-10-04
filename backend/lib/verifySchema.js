// Schema verification.

const pool = require("../db");

/** Required database object, mapped to the SQL file that defines it. */
const REQUIRED_OBJECTS = {
    users: "schema.v2.sql",
    vendors: "schema.v2.sql",
    categories: "schema.v2.sql",
    locations: "schema.v2.sql",
    vendor_listings: "schema.v2.sql",
    listing_photos: "schema.v2.sql",
    quote_requests: "schema.v2.sql",
    v_search_trends_daily: "schema.v2.sql",
    v_moderation_queue: "schema.v2.sql",
    vendor_opening_hours: "schema.v2.1.sql",
    events: "schema.v2.1.sql",
    saved_businesses: "schema.v2.1.sql",
    v_business_cards: "schema.v2.1.sql",
    vendor_facts: "schema.v2.2.sql",
    vendor_payment_methods: "schema.v2.3.sql",
    vendor_search_impressions: "schema.v2.4.sql",
    vendor_photos: "schema.v2.5.sql",
    vendor_social_links: "schema.v2.5.sql",
};

// Required columns added to existing tables, as "table.column".
const REQUIRED_COLUMNS = {
    "reviews.review_reply": "schema.v2.6.sql",

    "vendors.vendor_nid_reference": "schema.v2.7.sql",
    "vendors.vendor_nid_status": "schema.v2.7.sql",
    "vendors.vendor_nid_submitted_at": "schema.v2.7.sql",
    "vendors.vendor_nid_verified_at": "schema.v2.7.sql",
    "vendors.vendor_nid_verified_by": "schema.v2.7.sql",
};

// Checks all required objects in a single query.
async function verifySchema() {
    const names = Object.keys(REQUIRED_OBJECTS);

    const { rows } = await pool.query(
        `SELECT n AS name, to_regclass(n) IS NOT NULL AS present
         FROM unnest($1::text[]) AS n`,
        [names]
    );

    const columns = await pool.query(
        `SELECT c AS name, EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = current_schema()
               AND table_name = split_part(c, '.', 1) AND column_name = split_part(c, '.', 2)
         ) AS present
         FROM unnest($1::text[]) AS c`,
        [Object.keys(REQUIRED_COLUMNS)]
    );

    const missing = [
        ...rows.filter((row) => !row.present).map((row) => ({ name: row.name, file: REQUIRED_OBJECTS[row.name] })),
        ...columns.rows.filter((row) => !row.present).map((row) => ({ name: row.name, file: REQUIRED_COLUMNS[row.name] })),
    ];

    return {
        ok: missing.length === 0,
        missing,
        missingFiles: [...new Set(missing.map((item) => item.file))],
    };
}

// Logs schema status at startup so an incomplete database is reported before the first request fails.
async function reportSchemaAtStartup() {
    try {
        const result = await verifySchema();

        if (result.ok) {
            console.log("Database schema verified.");
            return;
        }

        console.warn("");
        console.warn("  WARNING: required database objects are missing.");
        console.warn("");
        for (const { name, file } of result.missing) {
            console.warn(`    ${name.padEnd(24)} defined in ${file}`);
        }
        console.warn("");
        console.warn("  Load:  npm run db:load     (from the repository root)");
        console.warn("  Reset: npm run db:reset");
        console.warn("");
    } catch (err) {
        // Connection failures are reported by /api/health; avoid duplicating them.
        console.warn(`Schema verification skipped: ${err.message}`);
    }
}

module.exports = { verifySchema, reportSchemaAtStartup };
