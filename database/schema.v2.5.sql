-- Schema v2.5: business photos and social links, edited from the Add / Edit Business page.

BEGIN;

-- Photos of the business itself, as opposed to listing_photos, which belong to a product or service.
CREATE TABLE vendor_photos (
    vendor_photo_id     SERIAL PRIMARY KEY,
    vendor_id           INT  NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    vendor_photo_url    TEXT NOT NULL,
    vendor_photo_alt    VARCHAR(255),
    vendor_photo_sort   SMALLINT NOT NULL DEFAULT 0,
    vendor_photo_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vendor_photos_vendor ON vendor_photos (vendor_id, vendor_photo_sort);

-- Existing covers become each business's first photo, so "cover = first photo" holds from the start.
INSERT INTO vendor_photos (vendor_id, vendor_photo_url, vendor_photo_sort)
SELECT vendor_id, vendor_cover_url, 0
FROM vendors
WHERE vendor_cover_url IS NOT NULL;

-- One link per platform.
CREATE TABLE vendor_social_links (
    vendor_id    INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    social_platform VARCHAR(20) NOT NULL
        CHECK (social_platform IN ('facebook', 'instagram', 'youtube', 'tiktok')),
    social_url   VARCHAR(255) NOT NULL,
    PRIMARY KEY (vendor_id, social_platform)
);

COMMIT;
