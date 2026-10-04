const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/sitemap: approved businesses and non-empty active categories for sitemap.xml.
router.get("/sitemap", async (req, res) => {
    try {
        const [businesses, categories] = await Promise.all([
            pool.query(
                `SELECT vendor_slug AS slug, vendor_updated_at AS updated_at
                 FROM vendors
                 WHERE vendor_status = 'approved'
                 ORDER BY vendor_id`
            ),
            pool.query(
                `SELECT c.category_slug AS slug
                 FROM categories c
                 LEFT JOIN categories parent ON parent.category_id = c.category_parent_id
                 WHERE c.category_is_active AND (parent.category_id IS NULL OR parent.category_is_active)
                   AND EXISTS (
                       SELECT 1 FROM vendor_categories vc
                       JOIN categories c2 ON c2.category_id = vc.category_id
                       JOIN vendors v ON v.vendor_id = vc.vendor_id AND v.vendor_status = 'approved'
                       WHERE c2.category_id = c.category_id OR c2.category_parent_id = c.category_id
                   )
                 ORDER BY c.category_sort_order, c.category_id`
            ),
        ]);

        res.json({ businesses: businesses.rows, categories: categories.rows });
    } catch (err) {
        console.error("GET /api/sitemap failed:", err);
        res.status(500).json({ error: "Could not build the sitemap" });
    }
});

module.exports = router;
