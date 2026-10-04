const pool = require("../db");

// TODO(auth): replace with the signed-in customer; until then the first active customer acts for everyone.
async function currentCustomerId(db = pool) {
    const result = await db.query(
        `SELECT user_id FROM users
         WHERE user_role = 'customer' AND user_status = 'active'
         ORDER BY user_id LIMIT 1`
    );
    return result.rows[0]?.user_id ?? null;
}

// TODO(auth): replace with the signed-in admin.
async function currentAdminId(db = pool) {
    const result = await db.query(
        `SELECT user_id FROM users
         WHERE user_role = 'admin' AND user_status = 'active'
         ORDER BY user_id LIMIT 1`
    );
    return result.rows[0]?.user_id ?? null;
}

// Returns the owner's user id for a business, or null when it does not exist.
async function vendorOwnerId(vendorId, db = pool) {
    const result = await db.query("SELECT user_id FROM vendors WHERE vendor_id = $1", [vendorId]);
    return result.rows[0]?.user_id ?? null;
}

// Parses a positive INT id from a route parameter, or returns null.
function parseId(raw) {
    const text = String(raw ?? "");
    return /^\d{1,10}$/.test(text) && Number(text) > 0 && Number(text) <= 2147483647 ? Number(text) : null;
}

// Trims a text field and returns null when it is not a string.
function cleanText(value) {
    return typeof value === "string" ? value.trim() : null;
}

module.exports = { currentCustomerId, currentAdminId, vendorOwnerId, parseId, cleanText };
