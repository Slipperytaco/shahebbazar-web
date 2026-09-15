const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all inquiries for a vendor
router.get("/vendors/:vendorId/inquiries", async (req, res) => {
    const vendorId = Number(req.params.vendorId);

    if (isNaN(vendorId)) {
        return res.status(400).json({ error: "Invalid vendor ID" });
    }

    try {
        const result = await pool.query(
            `SELECT i.*, l.title AS listing_title
             FROM inquiries i
             LEFT JOIN vendor_listings l ON i.listing_id = l.listing_id
             WHERE i.vendor_id = $1
             ORDER BY i.created_at DESC`,
            [vendorId]
        );

        res.json({ inquiries: result.rows });
    } catch (err) {
        console.error("Error loading inquiries:", err);
        res.status(500).json({ error: "Failed to load inquiries" });
    }
});

// Respond to an inquiry
router.post("/inquiries/:inquiryId/respond", async (req, res) => {
    const inquiryId = Number(req.params.inquiryId);
    const { response } = req.body;

    if (!response) {
        return res.status(400).json({ error: "Response message required" });
    }

    try {
        await pool.query(
            `UPDATE inquiries 
             SET status = 'read', vendor_response = $1 
             WHERE inquiry_id = $2`,
            [response, inquiryId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Error responding to inquiry:", err);
        res.status(500).json({ error: "Failed to send response" });
    }
});

// CREATE inquiry (listing or vendor)
router.post("/inquiries", async (req, res) => {
    const {
        vendor_id,
        listing_id,
        customer_name,
        customer_email,
        message
    } = req.body;

    if (!vendor_id || !message) {
        return res.status(400).json({ error: "vendor_id and message are required" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO inquiries (vendor_id, listing_id, customer_name, customer_email, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [vendor_id, listing_id || null, customer_name || null, customer_email || null, message]
        );

        res.json({ inquiry: result.rows[0] });
    } catch (err) {
        console.error("Error creating inquiry:", err);
        res.status(500).json({ error: "Failed to create inquiry" });
    }
});

module.exports = router;
