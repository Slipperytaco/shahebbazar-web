/**
 * Schema verification.
 *
 * Confirms that the database objects the API depends on exist. Connecting
 * successfully does not imply a loaded schema: `SELECT NOW()` succeeds
 * against an empty database while every data endpoint returns 500.
 */

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
};

/**
 * Checks all required objects in a single query.
 *
 * `to_regclass` returns NULL rather than raising for an absent object,
 * allowing every name to be tested in one round trip.
 *
 * @returns {Promise<{ok: boolean, missing: Array<{name: string, file: string}>, missingFiles: string[]}>}
 */
async function verifySchema() {
    const names = Object.keys(REQUIRED_OBJECTS);

    const { rows } = await pool.query(
        `SELECT n AS name, to_regclass(n) IS NOT NULL AS present
         FROM unnest($1::text[]) AS n`,
        [names]
    );

    const missing = rows
        .filter((row) => !row.present)
        .map((row) => ({ name: row.name, file: REQUIRED_OBJECTS[row.name] }));

    return {
        ok: missing.length === 0,
        missing,
        missingFiles: [...new Set(missing.map((item) => item.file))],
    };
}

/**
 * Logs schema status at startup so an incomplete database is reported
 * before the first request fails.
 */
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
