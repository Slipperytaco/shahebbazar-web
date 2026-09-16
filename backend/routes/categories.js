const express = require("express");
const router = express.Router();
const pool = require("../db");

// GLOBAL categories route
router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories ORDER BY category_id ASC"
        );
        res.json({ categories: result.rows });
    } catch (err) {
        console.error("Category fetch error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
