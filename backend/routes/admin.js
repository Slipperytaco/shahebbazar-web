const express = require("express");
const db = require("../db.js");

const router = express.Router();

router.get("/vendors/pending", requireAuth, requireAdmin, async (req, res) => {
    const result = await db.query("SELECT * FROM vendors WHERE verified = false");
    res.json(result.rows);
});

router.post("/vendors/:id/approve", requireAuth, requireAdmin, async (req, res) => {
    const vendorId = req.params.id;
    await db.query("UPDATE vendors SET verified = true WHERE vendor_id = $1", [vendorId]);
    res.json({ success: true });
});

router.post("/listings/:id/approve", requireAuth, requireAdmin, async (req, res) => {
    const listingId = req.params.id;
    await db.query("UPDATE vendor_listings SET approved = true WHERE listing_id = $1", [listingId]);
    res.json({ success: true });
});

module.exports = router;
