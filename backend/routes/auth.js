const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
    const { user_name, user_email, user_password } = req.body;

    try {
        const hashed = await bcrypt.hash(user_password, 10);

        const result = await pool.query(
            `INSERT INTO users (user_name, user_email, user_password_hash)
             VALUES ($1, $2, $3)
             RETURNING user_id, role, user_name, user_email`,
            [user_name, user_email, hashed]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { user_email, user_password } = req.body;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE user_email = $1`,
            [user_email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(user_password, user.user_password_hash);

        if (!match) {
            return res.status(400).json({ success: false, error: "Invalid password" });
        }
        res.json({
            success: true,
            user: {
                user_id: user.user_id,
                role: user.role,
                user_name: user.user_name,
                user_email: user.user_email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
