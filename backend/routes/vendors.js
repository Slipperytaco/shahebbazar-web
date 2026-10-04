const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                vendor_id,
                vendor_name,
                vendor_name_bn,
                vendor_slug,
                vendor_description,
                vendor_phone,
                vendor_email,
                vendor_address,
                location_id,
                vendor_logo_url,
                vendor_cover_url,
                vendor_business_type,
                vendor_status,
                vendor_is_featured,
                vendor_created_at
             FROM vendors
             WHERE vendor_status = 'approved'
             ORDER BY vendor_name ASC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error("GET /api/vendors failed:", err);
        res.status(500).json({ error: "Unable to retrieve vendors" });
    }
});

// Converts a business name to a URL slug.
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

// Finds a free slug, appending -2, -3 ... on collision, by reading the taken values first.
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

// Resolves a free-text city or area to a locations row; an unknown place simply leaves it unset.
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

// Vendor registration.// Vendor registration with stubbed NID verification.
router.post("/", async (req, res) => {
    const {
        vendor_name,
        vendor_email,
        vendor_phone,
        vendor_address,
        vendor_city,
        vendor_nid_reference
    } = req.body;

    if (!vendor_name || !String(vendor_name).trim()) {
        return res.status(400).json({
            success: false,
            error: "Business name is required"
        });
    }

    if (!vendor_phone || !String(vendor_phone).trim()) {
        return res.status(400).json({
            success: false,
            error: "Phone number is required"
        });
    }

    if (
        !vendor_nid_reference ||
        !String(vendor_nid_reference).trim()
    ) {
        return res.status(400).json({
            success: false,
            error: "NID reference is required"
        });
    }

    const name = String(vendor_name).trim();
    const phone = String(vendor_phone).trim();

    const email =
        vendor_email && String(vendor_email).trim()
            ? String(vendor_email).trim()
            : null;

    const address =
        vendor_address && String(vendor_address).trim()
            ? String(vendor_address).trim()
            : null;

    const nidReference = String(vendor_nid_reference).trim();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const locationId = await resolveLocation(client, vendor_city);
        const slug = await uniqueSlug(client, slugify(name));

        // Create the account first.
        const userResult = await client.query(
            `INSERT INTO users (
                user_phone,
                user_email,
                user_name,
                user_role
            )
            VALUES ($1, $2, $3, 'vendor')
            RETURNING user_id`,
            [phone, email, name]
        );

        const userId = userResult.rows[0].user_id;

        // Create the related vendor profile.
        const vendorResult = await client.query(
            `INSERT INTO vendors (
                user_id,
                vendor_name,
                vendor_slug,
                vendor_phone,
                vendor_email,
                vendor_address,
                location_id,
                vendor_nid_reference,
                vendor_nid_status,
                vendor_nid_submitted_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                'pending',
                NOW()
            )
            RETURNING
                vendor_id,
                vendor_name,
                vendor_slug,
                vendor_phone,
                vendor_email,
                vendor_address,
                location_id,
                vendor_status,
                vendor_nid_status,
                vendor_nid_submitted_at,
                vendor_created_at`,
            [
                userId,
                name,
                slug,
                phone,
                email,
                address,
                locationId,
                nidReference
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message:
                "Vendor registered and submitted for NID verification.",
            vendor: vendorResult.rows[0]
        });
    } catch (err) {
        await client.query("ROLLBACK");

        if (err.code === "23505") {
            let field = "account detail";

            if (err.constraint === "users_user_email_key") {
                field = "email address";
            }

            if (err.constraint === "users_user_phone_key") {
                field = "phone number";
            }

            return res.status(409).json({
                success: false,
                error: `That ${field} is already registered`
            });
        }

        console.error("POST /api/vendors failed:", err);

        return res.status(500).json({
            success: false,
            error: "Unable to register vendor"
        });
    } finally {
        client.release();
    }
});

module.exports = router;
