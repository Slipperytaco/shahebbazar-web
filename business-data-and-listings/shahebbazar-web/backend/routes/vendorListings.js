const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");

// Storage config for uploaded photos (local storage for now)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Keep original extension
        const ext = file.originalname.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG and PNG images allowed"));
        }
        cb(null, true);
    }
});

// create listing: 

router.post("/vendors/:vendorId/listings", async (req, res) => {
    const { vendorId } = req.params;
    const { title, description, price, category } = req.body;
    console.log("Vendor ID:", vendorId);
    console.log("Form data:", req.body);

    try {
        const result = await pool.query(
            `INSERT INTO vendor_listings 
       (vendor_id, title, description, price, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING listing_id`,
            [vendorId, title, description, price, category]
        );

        console.log("Insert result:", result.rows);

        res.json({
            success: true,
            listing_id: result.rows[0].listing_id
        });
    } catch (err) {
        console.error("Listing creation error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// upload photos for a listing: 
router.post(
    "/listings/:listingId/photos",
    (req, res, next) => {
        upload.array("photos")(req, res, function (err) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }
            next();
        });
    },
    async (req, res) => {
        const { listingId } = req.params;

        try {
            const photoFiles = req.files;

            for (const file of photoFiles) {
                await pool.query(
                    `INSERT INTO listing_photos (listing_id, photo_url)
                     VALUES ($1, $2)`,
                    [listingId, file.path]
                );
            }

            res.json({ success: true, message: "Photos uploaded" });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
);

// get all listings for a vendor: 
router.get("/vendors/:vendorId/listings", async (req, res) => {
    const { vendorId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM vendor_listings
       WHERE vendor_id = $1
       ORDER BY listing_id DESC`,
            [vendorId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// delete listings: 

router.delete("/listings/:listingId", async (req, res) => {
    const { listingId } = req.params;

    try {
        await pool.query(`DELETE FROM listing_photos WHERE listing_id = $1`, [listingId]);
        await pool.query(`DELETE FROM vendor_listings WHERE listing_id = $1`, [listingId]);

        res.json({ success: true, message: "Listing deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


module.exports = router;