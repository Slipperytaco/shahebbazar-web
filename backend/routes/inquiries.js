const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/vendors/:vendorId/inquiries", async (req, res) => {
  const vendorId = Number(req.params.vendorId);

  if (isNaN(vendorId)) {
    return res.status(400).json({ error: "Invalid vendor ID" });
  }

  try {
    const result = await pool.query(
      `SELECT 
          i.*,
          l.title AS listing_title,
          p.product_name AS product_name,
          c.category_name AS category_name
       FROM inquiries i
       LEFT JOIN vendor_listings l ON i.listing_id = l.listing_id
       LEFT JOIN vendor_products p ON i.product_id = p.product_id
       LEFT JOIN categories c ON i.category_id = c.category_id
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

router.post("/inquiries", async (req, res) => {
  const {
    vendor_id,
    listing_id,
    inquiry_type,
    product_id,
    category_id,
    customer_name,
    customer_email,
    message
  } = req.body;

  if (!vendor_id || !message) {
    return res.status(400).json({ error: "vendor_id and message are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO inquiries (
          vendor_id,
          listing_id,
          inquiry_type,
          product_id,
          category_id,
          customer_name,
          customer_email,
          message
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        vendor_id,
        listing_id || null,
        inquiry_type || "general",
        product_id || null,
        category_id || null,
        customer_name || null,
        customer_email || null,
        message
      ]
    );

    res.json({ inquiry: result.rows[0] });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(500).json({ error: "Failed to create inquiry" });
  }
});

router.get("/vendors/:vendorId/products", async (req, res) => {
  const vendorId = Number(req.params.vendorId);

  try {
    const result = await pool.query(
      `SELECT product_id, product_name
       FROM vendor_products
       WHERE vendor_id = $1`,
      [vendorId]
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error("Error loading products:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
});


router.get("/vendors/:vendorId/categories", async (req, res) => {
  const vendorId = Number(req.params.vendorId);

  try {
    const result = await pool.query(
      `SELECT c.category_id, c.category_name
       FROM vendor_categories vc
       JOIN categories c ON vc.category_id = c.category_id
       WHERE vc.vendor_id = $1`,
      [vendorId]
    );

    res.json({ categories: result.rows });
  } catch (err) {
    console.error("Error loading categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});



module.exports = router;
