const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch listing
    const listingResult = await db.query(
      "SELECT * FROM vendor_listings WHERE listing_id = $1",
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listing = listingResult.rows[0];

    // Fetch photos
    const photosResult = await db.query(
      "SELECT photo_url FROM listing_photos WHERE listing_id = $1",
      [id]
    );

    listing.photos = photosResult.rows; // array of { photo_url }
    console.log("PHOTOS:", listing.photos);


    res.json({ listing });
  } catch (err) {
    console.error("LISTINGS ROUTE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
