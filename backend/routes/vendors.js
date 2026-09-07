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


// this route handles vendor registration , handling details from front end and inserts them into DB 
router.post('/', async (req, res) => {
    const {
        vendor_name,
        vendor_email,
        vendor_phone,
        vendor_address,
        vendor_city
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO vendors 
      (vendor_name, vendor_email, vendor_phone, vendor_address, vendor_city)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
            [
                vendor_name,
                vendor_email,
                vendor_phone,
                vendor_address,
                vendor_city
            ]
        );

        res.json({ success: true, vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
