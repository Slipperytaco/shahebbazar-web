const express = require("express");
const pool = require("../db");

const router = express.Router();

const EVENT_COLUMNS = `
    e.event_id, e.event_title, e.event_title_bn, e.event_slug, e.event_description,
    e.event_venue, e.event_starts_at, e.event_ends_at, e.event_image_url,
    loc.location_name AS area_name, v.vendor_name, v.vendor_slug`;

const EVENT_JOINS = `
    FROM events e
    LEFT JOIN locations loc ON loc.location_id = e.location_id
    LEFT JOIN vendors v ON v.vendor_id = e.vendor_id AND v.vendor_status = 'approved'`;

router.get("/events", async (req, res) => {
    try {
        const [upcoming, past] = await Promise.all([
            pool.query(
                `SELECT ${EVENT_COLUMNS} ${EVENT_JOINS}
                 WHERE e.event_status = 'published' AND COALESCE(e.event_ends_at, e.event_starts_at) >= NOW()
                 ORDER BY e.event_starts_at`
            ),
            pool.query(
                `SELECT ${EVENT_COLUMNS} ${EVENT_JOINS}
                 WHERE e.event_status = 'published' AND COALESCE(e.event_ends_at, e.event_starts_at) < NOW()
                 ORDER BY e.event_starts_at DESC LIMIT 10`
            ),
        ]);
        res.json({ upcoming: upcoming.rows, past: past.rows });
    } catch (err) {
        console.error("GET /api/events failed:", err);
        res.status(500).json({ error: "Could not load events" });
    }
});

router.get("/events/:slug", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${EVENT_COLUMNS} ${EVENT_JOINS} WHERE e.event_slug = $1 AND e.event_status = 'published'`,
            [req.params.slug]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: "Event not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`GET /api/events/${req.params.slug} failed:`, err);
        res.status(500).json({ error: "Could not load the event" });
    }
});

module.exports = router;
