-- =====================================================================
-- Shahebbazar -- schema v2.1 (additive)
-- =====================================================================
--
-- Adds three tables required by the home page and business profile that
-- schema.v2.sql does not provide:
--
--   vendor_opening_hours  open state indicator and the weekly hours table
--   events                the upcoming events list
--   saved_businesses      per-account bookmarks
--
-- Run AFTER schema.v2.sql and before seed.v2.sql, or on top of an already
-- seeded database -- it only adds.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Opening hours
--
-- One row per day per vendor. day_of_week follows PostgreSQL EXTRACT(DOW)
-- (0 = Sunday to 6 = Saturday) so the open-state comparison requires no
-- mapping in the application.
--
-- An absent row means hours are not recorded. This must be rendered as
-- unknown rather than as closed.
-- ---------------------------------------------------------------------
CREATE TABLE vendor_opening_hours (
    hours_id        SERIAL PRIMARY KEY,
    vendor_id       INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    hours_day_of_week SMALLINT NOT NULL CHECK (hours_day_of_week BETWEEN 0 AND 6),
    hours_open_time   TIME,
    hours_close_time  TIME,
    hours_is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
    hours_is_24h      BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (vendor_id, hours_day_of_week),
    -- Both times are required unless the day is closed or continuous.
    CHECK (
        hours_is_closed
        OR hours_is_24h
        OR (hours_open_time IS NOT NULL AND hours_close_time IS NOT NULL)
    )
);
CREATE INDEX idx_hours_vendor ON vendor_opening_hours (vendor_id);

-- ---------------------------------------------------------------------
-- Events
--
-- Platform-wide events. vendor_id is nullable because most events have no
-- owning business.
-- ---------------------------------------------------------------------
CREATE TABLE events (
    event_id          SERIAL PRIMARY KEY,
    event_title       VARCHAR(255) NOT NULL,
    event_title_bn    VARCHAR(255),
    event_slug        VARCHAR(255) NOT NULL UNIQUE,
    event_description TEXT,
    event_venue       VARCHAR(255),
    location_id       INT REFERENCES locations(location_id) ON DELETE SET NULL,
    vendor_id         INT REFERENCES vendors(vendor_id)     ON DELETE SET NULL,
    event_starts_at   TIMESTAMPTZ NOT NULL,
    event_ends_at     TIMESTAMPTZ,
    event_image_url   TEXT,
    event_status      VARCHAR(20) NOT NULL DEFAULT 'published'
        CHECK (event_status IN ('draft','published','cancelled')),
    event_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (event_ends_at IS NULL OR event_ends_at >= event_starts_at)
);
-- Supports the upcoming published events query.
CREATE INDEX idx_events_upcoming ON events (event_starts_at)
    WHERE event_status = 'published';

-- ---------------------------------------------------------------------
-- Per-account saved businesses
-- ---------------------------------------------------------------------
CREATE TABLE saved_businesses (
    user_id    INT NOT NULL REFERENCES users(user_id)     ON DELETE CASCADE,
    vendor_id  INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, vendor_id)
);
CREATE INDEX idx_saved_vendor ON saved_businesses (vendor_id);

-- ---------------------------------------------------------------------
-- Public business card
--
-- Shared projection for every business list: name, primary category,
-- area, rating, review count and open state. Centralising the derivation
-- keeps the rating calculation in one place.
--
-- Open state is evaluated in the database session timezone, which must be
-- set to Asia/Dhaka in deployed environments.
-- ---------------------------------------------------------------------
CREATE VIEW v_business_cards AS
SELECT
    v.vendor_id,
    v.vendor_slug,
    v.vendor_name,
    v.vendor_name_bn,
    v.vendor_description,
    v.vendor_logo_url,
    v.vendor_cover_url,
    v.vendor_phone,
    v.vendor_address,
    v.vendor_is_featured,
    v.vendor_verified_at IS NOT NULL              AS is_verified,
    loc.location_name                             AS area_name,
    loc.location_name_bn                          AS area_name_bn,
    cat.category_name                             AS primary_category,
    cat.category_name_bn                          AS primary_category_bn,
    cat.category_slug                             AS primary_category_slug,
    COALESCE(r.avg_rating, 0)::numeric(2,1)       AS rating,
    COALESCE(r.review_count, 0)                   AS review_count,
    h.open_state,
    h.close_time_today
FROM vendors v
LEFT JOIN locations loc ON loc.location_id = v.location_id
-- Primary category is the vendor category with the lowest sort order.
LEFT JOIN LATERAL (
    SELECT c.category_name, c.category_name_bn, c.category_slug
    FROM vendor_categories vc
    JOIN categories c ON c.category_id = vc.category_id
    WHERE vc.vendor_id = v.vendor_id
    ORDER BY c.category_sort_order, c.category_id
    LIMIT 1
) cat ON TRUE
LEFT JOIN LATERAL (
    SELECT AVG(review_rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews
    WHERE vendor_id = v.vendor_id AND review_status = 'published'
) r ON TRUE
LEFT JOIN LATERAL (
    SELECT
        CASE
            WHEN oh.hours_is_closed THEN 'closed'
            WHEN oh.hours_is_24h    THEN 'open'
            WHEN LOCALTIME BETWEEN oh.hours_open_time AND oh.hours_close_time THEN 'open'
            ELSE 'closed'
        END AS open_state,
        CASE WHEN oh.hours_is_24h THEN NULL ELSE oh.hours_close_time END AS close_time_today
    FROM vendor_opening_hours oh
    WHERE oh.vendor_id = v.vendor_id
      AND oh.hours_day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
) h ON TRUE
WHERE v.vendor_status = 'approved';

COMMIT;
