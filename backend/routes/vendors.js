const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vendors');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Converts a business name to a URL slug.
 *
 * Non-Latin names strip to an empty string -- Bangla has no ASCII
 * equivalent -- so the caller must handle the empty result rather than
 * writing a slug of "".
 */
function slugify(text) {
    return String(text)
        .normalize('NFKD')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Finds a free slug, appending -2, -3 ... on collision.
 *
 * vendors.vendor_slug is UNIQUE, so this reads the taken values first
 * rather than inserting and catching the violation: inside a transaction
 * a failed statement aborts the whole thing.
 */
async function uniqueSlug(client, base) {
    const stem = base || 'vendor';

    const { rows } = await client.query(
        `SELECT vendor_slug FROM vendors
         WHERE vendor_slug = $1 OR vendor_slug LIKE $1 || '-%'`,
        [stem]
    );

    const taken = new Set(rows.map((r) => r.vendor_slug));
    if (!taken.has(stem)) return stem;

    let n = 2;
    while (taken.has(`${stem}-${n}`)) n += 1;
    return `${stem}-${n}`;
}

/**
 * Resolves a free-text city or area to a locations row.
 *
 * @returns location_id, or null when nothing matches. location_id is
 *          nullable, so an unrecognised place name is not a failure --
 *          the business is simply not filed under an area yet.
 */
async function resolveLocation(client, city) {
    if (!city || !city.trim()) return null;

    const { rows } = await client.query(
        `SELECT location_id FROM locations
         WHERE location_name ILIKE $1 OR location_slug = $2
         ORDER BY CASE location_type
                      WHEN 'area' THEN 1 WHEN 'city' THEN 2 ELSE 3
                  END
         LIMIT 1`,
        [city.trim(), slugify(city)]
    );

    return rows.length ? rows[0].location_id : null;
}

/**
 * Vendor registration.
 *
 * Creates the owning account and the business profile together. Identity
 * lives on `users` and the business profile on `vendors`, so registration
 * writes both -- one account can later hold several businesses.
 *
 * Wrapped in a transaction: without one, a failure on the second insert
 * would leave an account with no business and block the phone number from
 * being used again.
 *
 * No password is stored. The client specified phone OTP, and
 * users.user_password_hash stays NULL until that exists;
 * user_phone_verified_at stays NULL to mark the number as unverified.
 *
 * The business is created with vendor_status 'pending' (the column
 * default), so it is invisible to the public API until an admin approves
 * it -- v_business_cards filters on that status.
 */
router.post('/', async (req, res) => {
    const {
        vendor_name,
        vendor_email,
        vendor_phone,
        vendor_address,
        vendor_city,
    } = req.body;

    if (!vendor_name || !String(vendor_name).trim()) {
        return res.status(400).json({ success: false, error: 'Business name is required' });
    }
    if (!vendor_phone || !String(vendor_phone).trim()) {
        return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const name = String(vendor_name).trim();
    const phone = String(vendor_phone).trim();
    const email = vendor_email && String(vendor_email).trim() ? String(vendor_email).trim() : null;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const location_id = await resolveLocation(client, vendor_city);
        const slug = await uniqueSlug(client, slugify(name));

        // The account. Phone is the identifier; email is optional.
        const userResult = await client.query(
            `INSERT INTO users (user_phone, user_email, user_name, user_role)
             VALUES ($1, $2, $3, 'vendor')
             RETURNING user_id`,
            [phone, email, name]
        );

        const userId = userResult.rows[0].user_id;

        const vendorResult = await client.query(
            `INSERT INTO vendors
                 (user_id, vendor_name, vendor_slug, vendor_phone,
                  vendor_email, vendor_address, location_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING vendor_id, vendor_name, vendor_slug, vendor_phone,
                       vendor_email, vendor_address, location_id,
                       vendor_status, vendor_created_at`,
            [userId, name, slug, phone, email, vendor_address || null, location_id]
        );

        await client.query('COMMIT');

        res.status(201).json({ success: true, vendor: vendorResult.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');

        // 23505 is a unique violation. Report which value collided rather
        // than the raw constraint name.
        if (err.code === '23505') {
            const field = err.constraint === 'users_user_email_key' ? 'email address' : 'phone number';
            return res.status(409).json({
                success: false,
                error: `That ${field} is already registered`,
            });
        }

        console.error('POST /api/vendors failed:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
