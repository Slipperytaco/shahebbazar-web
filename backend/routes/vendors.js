const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vendors');

        res.json({
            success: true,
            vendors: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/search', async (req, res) => {
    const q = req.query.q;

    try {
        const result = await pool.query(
            `SELECT * FROM vendors 
             WHERE vendor_name ILIKE $1 
             OR vendor_city ILIKE $1`,
            [`%${q}%`]
        );

        res.json({
            success: true,
            vendors: result.rows
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// Register a vendor with stubbed NID verification
router.post("/", async (req, res) => {
    const {
        vendor_name,
        vendor_email,
        vendor_phone,
        vendor_address,
        vendor_city,
        nid_number
    } = req.body;

    // Basic Phase 1 validation
    if (
        !vendor_name?.trim() ||
        !vendor_phone?.trim() ||
        !nid_number?.trim()
    ) {
        return res.status(400).json({
            success: false,
            error: "Business name, phone number, and NID number are required."
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO vendors (
                vendor_name,
                vendor_email,
                vendor_phone,
                vendor_address,
                vendor_city,
                nid_number
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                vendor_name.trim(),
                vendor_email?.trim() || null,
                vendor_phone.trim(),
                vendor_address?.trim() || null,
                vendor_city?.trim() || null,
                nid_number.trim()
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Vendor registered and submitted for NID verification.",
            vendor: result.rows[0]
        });
    } catch (err) {
        console.error("Vendor registration error:", err);

        return res.status(500).json({
            success: false,
            error: "Unable to register vendor."
        });
    }
});

// get categories for a vendor: 
router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories ORDER BY category_id ASC"
        );
        res.json({ categories: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


module.exports = router;
