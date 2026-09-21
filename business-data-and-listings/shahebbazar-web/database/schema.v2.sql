-- =====================================================================
-- Shahebbazar -- Phase 1 schema (v2)
-- COS40005 Group 23 - PostgreSQL 15+
-- =====================================================================
--
-- Supersedes schema.sql. Each table corresponds to a numbered client
-- requirement. See database/SCHEMA-NOTES.md for the requirement mapping
-- and the migration path from the previous schema.
--
-- Conventions (from README.md, unchanged):
--   tables       snake_case plural
--   columns      table-prefixed snake_case
--   foreign keys <table>_id
--
-- Status columns use CHECK constraints rather than ENUM types. Extending
-- an ENUM requires ALTER TYPE, which has transactional restrictions; a
-- CHECK constraint is amended in a single statement.
--
-- Run order:  schema.v2.sql  ->  seed.v2.sql
-- =====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- trigram indexes, section 4

-- =====================================================================
-- 1. IDENTITY AND ACCESS   (requirement 2A: role-based access control,
--                          phone as the primary identifier)
-- =====================================================================

-- Single identity table for all three roles, so verification, sessions
-- and rate limiting are implemented once. The previous schema stored
-- credentials on `vendors` in addition to a separate `users` table,
-- requiring two authentication paths.
CREATE TABLE users (
    user_id             SERIAL PRIMARY KEY,
    -- Primary identifier, stored in E.164 format.
    user_phone          VARCHAR(20)  NOT NULL UNIQUE,
    -- Optional; phone is the required identifier.
    user_email          VARCHAR(255) UNIQUE,
    user_name           VARCHAR(255) NOT NULL,
    -- NULL for accounts authenticating by one-time code. Stores a hash only.
    user_password_hash  VARCHAR(255),
    user_role           VARCHAR(20)  NOT NULL DEFAULT 'customer'
        CHECK (user_role IN ('customer', 'vendor', 'admin')),
    user_phone_verified_at  TIMESTAMPTZ,
    user_status         VARCHAR(20)  NOT NULL DEFAULT 'active'
        CHECK (user_status IN ('active', 'suspended', 'deleted')),
    user_created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    user_updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_role ON users (user_role);

-- One-time codes for phone login and registration. Stored hashed so a
-- database disclosure does not expose usable codes.
CREATE TABLE otp_codes (
    otp_id          SERIAL PRIMARY KEY,
    otp_phone       VARCHAR(20)  NOT NULL,
    otp_code_hash   VARCHAR(255) NOT NULL,
    otp_purpose     VARCHAR(20)  NOT NULL DEFAULT 'login'
        CHECK (otp_purpose IN ('login', 'register', 'recover', 'verify')),
    otp_expires_at  TIMESTAMPTZ  NOT NULL,
    otp_attempts    SMALLINT     NOT NULL DEFAULT 0,
    otp_consumed_at TIMESTAMPTZ,
    otp_request_ip  INET,
    otp_created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- Supports the rate-limit lookup of recent codes issued to a number.
CREATE INDEX idx_otp_phone_created ON otp_codes (otp_phone, otp_created_at DESC);

-- Server-side sessions. The token is held only in an httpOnly cookie and
-- stored here as a hash, so database access alone cannot impersonate a user.
CREATE TABLE sessions (
    session_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token_hash  VARCHAR(255) NOT NULL UNIQUE,
    session_expires_at  TIMESTAMPTZ  NOT NULL,
    session_user_agent  TEXT,
    session_ip          INET,
    session_created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- =====================================================================
-- 2. GEOGRAPHY   (requirement: support expansion beyond the initial city)
-- =====================================================================

-- Self-referencing hierarchy: country > division > district > city > area.
-- Expanding to a new region is an INSERT rather than a schema change. A
-- plain city column on `vendors` would require a migration instead.
CREATE TABLE locations (
    location_id         SERIAL PRIMARY KEY,
    location_parent_id  INT REFERENCES locations(location_id) ON DELETE RESTRICT,
    location_name       VARCHAR(255) NOT NULL,
    location_name_bn    VARCHAR(255),
    location_type       VARCHAR(20)  NOT NULL
        CHECK (location_type IN ('country', 'division', 'district', 'city', 'area')),
    location_slug       VARCHAR(255) NOT NULL UNIQUE,
    -- Materialised ancestry path, allowing subtree queries by prefix match
    -- rather than a recursive CTE.
    location_path       TEXT NOT NULL,
    location_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_locations_parent ON locations (location_parent_id);
CREATE INDEX idx_locations_path   ON locations (location_path text_pattern_ops);

-- =====================================================================
-- 3. TAXONOMY
-- =====================================================================

-- Hierarchical, with a slug used as the public URL segment.
CREATE TABLE categories (
    category_id         SERIAL PRIMARY KEY,
    category_parent_id  INT REFERENCES categories(category_id) ON DELETE RESTRICT,
    category_name       VARCHAR(255) NOT NULL,
    category_name_bn    VARCHAR(255),
    category_slug       VARCHAR(255) NOT NULL UNIQUE,
    category_icon       VARCHAR(64),
    category_sort_order SMALLINT NOT NULL DEFAULT 0,
    category_is_active  BOOLEAN  NOT NULL DEFAULT TRUE,
    UNIQUE (category_parent_id, category_name)
);
CREATE INDEX idx_categories_parent ON categories (category_parent_id);

-- =====================================================================
-- 4. VENDORS   (business profiles)
-- =====================================================================

CREATE TABLE vendors (
    vendor_id           SERIAL PRIMARY KEY,
    -- Owning account. Separating identity from business profile allows one
    -- account to hold several businesses.
    user_id             INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vendor_name         VARCHAR(255) NOT NULL,
    vendor_name_bn      VARCHAR(255),
    vendor_slug         VARCHAR(255) NOT NULL UNIQUE,
    vendor_description  TEXT,
    vendor_phone        VARCHAR(20)  NOT NULL,
    vendor_email        VARCHAR(255),
    vendor_whatsapp     VARCHAR(20),
    vendor_address      TEXT,
    location_id         INT REFERENCES locations(location_id) ON DELETE SET NULL,
    vendor_lat          NUMERIC(9,6),
    vendor_lng          NUMERIC(9,6),
    vendor_logo_url     TEXT,
    vendor_cover_url    TEXT,
    -- Determines quotation behaviour for business and consumer buyers.
    vendor_business_type VARCHAR(10) NOT NULL DEFAULT 'both'
        CHECK (vendor_business_type IN ('b2b', 'b2c', 'both')),
    -- Moderation state. Only approved records are exposed publicly.
    vendor_status       VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (vendor_status IN ('draft','pending','approved','rejected','suspended')),
    vendor_verified_at      TIMESTAMPTZ,
    vendor_verified_by      INT REFERENCES users(user_id) ON DELETE SET NULL,
    vendor_rejection_reason TEXT,
    -- Paid placement. Must be rendered with a visible label and returned
    -- separately from organic results.
    vendor_is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
    vendor_featured_until TIMESTAMPTZ,
    vendor_created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vendor_updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vendors_user      ON vendors (user_id);
CREATE INDEX idx_vendors_location  ON vendors (location_id);
CREATE INDEX idx_vendors_status    ON vendors (vendor_status);
CREATE INDEX idx_vendors_name_trgm ON vendors USING GIN (vendor_name gin_trgm_ops);

CREATE TABLE vendor_categories (
    vendor_id   INT NOT NULL REFERENCES vendors(vendor_id)      ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, category_id)
);
CREATE INDEX idx_vendor_categories_category ON vendor_categories (category_id);

-- =====================================================================
-- 5. LISTINGS   (products and services)
-- =====================================================================

CREATE TABLE vendor_listings (
    listing_id          SERIAL PRIMARY KEY,
    vendor_id           INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    -- Replaces a free-text category column, which permitted inconsistent
    -- values and unreliable filtering.
    category_id         INT REFERENCES categories(category_id) ON DELETE SET NULL,
    listing_title       VARCHAR(255) NOT NULL,
    listing_title_bn    VARCHAR(255),
    listing_slug        VARCHAR(255) NOT NULL,
    listing_description TEXT,
    listing_price       NUMERIC(12,2),
    -- Upper bound for sellers quoting a price range.
    listing_price_max   NUMERIC(12,2),
    listing_price_unit  VARCHAR(32),
    listing_min_order_qty  INT,
    listing_is_negotiable  BOOLEAN NOT NULL DEFAULT TRUE,
    listing_status      VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (listing_status IN ('draft','pending','approved','rejected','archived')),
    listing_rejection_reason TEXT,
    listing_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    listing_updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Unique per vendor, so the same slug may occur under different vendors.
    UNIQUE (vendor_id, listing_slug),
    CHECK (listing_price_max IS NULL OR listing_price IS NULL
           OR listing_price_max >= listing_price)
);
CREATE INDEX idx_listings_vendor     ON vendor_listings (vendor_id);
CREATE INDEX idx_listings_category   ON vendor_listings (category_id);
CREATE INDEX idx_listings_status     ON vendor_listings (listing_status);
CREATE INDEX idx_listings_title_trgm ON vendor_listings USING GIN (listing_title gin_trgm_ops);

CREATE TABLE listing_photos (
    photo_id          SERIAL PRIMARY KEY,
    listing_id        INT NOT NULL REFERENCES vendor_listings(listing_id) ON DELETE CASCADE,
    photo_url         TEXT NOT NULL,
    -- Supplies the image alt attribute, required for accessibility.
    photo_alt_text    VARCHAR(255),
    photo_sort_order  SMALLINT NOT NULL DEFAULT 0,
    photo_is_primary  BOOLEAN  NOT NULL DEFAULT FALSE,
    photo_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_photos_listing ON listing_photos (listing_id);
-- At most one primary photograph per listing; used as the preview image.
CREATE UNIQUE INDEX uq_photos_primary ON listing_photos (listing_id)
    WHERE photo_is_primary;

-- =====================================================================
-- 6. QUOTATIONS   (requirement 1: Phase 1 monetisation. Payment gateway
--                 integration is deferred to Phase 2)
-- =====================================================================

-- Buyer-initiated price request. The platform records the request and the
-- response; payment is settled outside the system.
CREATE TABLE quote_requests (
    rfq_id              SERIAL PRIMARY KEY,
    -- Short human-readable reference shown to both parties.
    rfq_public_ref      VARCHAR(16) NOT NULL UNIQUE,
    -- NULL for guest requests; the contact fields below apply instead.
    user_id             INT REFERENCES users(user_id) ON DELETE SET NULL,
    rfq_contact_name    VARCHAR(255) NOT NULL,
    rfq_contact_phone   VARCHAR(20)  NOT NULL,
    rfq_contact_email   VARCHAR(255),
    -- Addressed to a single business, or broadcast across a category.
    vendor_id           INT REFERENCES vendors(vendor_id)          ON DELETE CASCADE,
    listing_id          INT REFERENCES vendor_listings(listing_id) ON DELETE SET NULL,
    category_id         INT REFERENCES categories(category_id)     ON DELETE SET NULL,
    rfq_title           VARCHAR(255) NOT NULL,
    rfq_details         TEXT,
    rfq_quantity        NUMERIC(12,2),
    rfq_unit            VARCHAR(32),
    rfq_target_price    NUMERIC(12,2),
    rfq_needed_by       DATE,
    rfq_delivery_location_id INT REFERENCES locations(location_id) ON DELETE SET NULL,
    rfq_status          VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (rfq_status IN ('open','quoted','accepted','closed','expired')),
    rfq_created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rfq_expires_at      TIMESTAMPTZ,
    -- A request must target a business or a category.
    CHECK (vendor_id IS NOT NULL OR category_id IS NOT NULL)
);
CREATE INDEX idx_rfq_vendor  ON quote_requests (vendor_id, rfq_status);
CREATE INDEX idx_rfq_user    ON quote_requests (user_id);
CREATE INDEX idx_rfq_created ON quote_requests (rfq_created_at DESC);

CREATE TABLE quote_responses (
    quote_id            SERIAL PRIMARY KEY,
    rfq_id              INT NOT NULL REFERENCES quote_requests(rfq_id) ON DELETE CASCADE,
    vendor_id           INT NOT NULL REFERENCES vendors(vendor_id)     ON DELETE CASCADE,
    quote_price         NUMERIC(12,2) NOT NULL,
    quote_currency      CHAR(3) NOT NULL DEFAULT 'BDT',
    quote_lead_time_days INT,
    -- Settlement terms agreed outside the platform. Gateway integration
    -- is deferred to a later phase.
    quote_payment_terms VARCHAR(20) NOT NULL DEFAULT 'cash_on_delivery'
        CHECK (quote_payment_terms IN
               ('cash_on_delivery','advance','partial_advance','credit','negotiable')),
    quote_notes         TEXT,
    quote_valid_until   DATE,
    quote_status        VARCHAR(20) NOT NULL DEFAULT 'sent'
        CHECK (quote_status IN ('sent','accepted','rejected','withdrawn','expired')),
    quote_created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One response per vendor per request; revisions update the row.
    UNIQUE (rfq_id, vendor_id)
);
CREATE INDEX idx_quotes_vendor ON quote_responses (vendor_id, quote_status);

-- =====================================================================
-- 7. MESSAGING AND NOTIFICATIONS   (requirement 2D)
-- =====================================================================

CREATE TABLE conversations (
    conversation_id     SERIAL PRIMARY KEY,
    vendor_id           INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    user_id             INT NOT NULL REFERENCES users(user_id)     ON DELETE CASCADE,
    listing_id          INT REFERENCES vendor_listings(listing_id) ON DELETE SET NULL,
    rfq_id              INT REFERENCES quote_requests(rfq_id)      ON DELETE SET NULL,
    conversation_status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (conversation_status IN ('open','closed','blocked')),
    conversation_created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    conversation_last_message_at TIMESTAMPTZ,
    -- One thread per buyer, business and listing combination, preventing
    -- duplicate conversations.
    UNIQUE (vendor_id, user_id, listing_id)
);
CREATE INDEX idx_conversations_vendor
    ON conversations (vendor_id, conversation_last_message_at DESC);
CREATE INDEX idx_conversations_user
    ON conversations (user_id, conversation_last_message_at DESC);

CREATE TABLE messages (
    message_id       SERIAL PRIMARY KEY,
    conversation_id  INT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_user_id   INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message_body     TEXT NOT NULL,
    message_read_at  TIMESTAMPTZ,
    message_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON messages (conversation_id, message_created_at);

-- Outbound notification queue. Rows are written first and dispatched by a
-- worker, so a failed delivery is retryable rather than lost.
CREATE TABLE notifications (
    notification_id      SERIAL PRIMARY KEY,
    user_id              INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type    VARCHAR(40) NOT NULL,
    notification_channel VARCHAR(10) NOT NULL
        CHECK (notification_channel IN ('in_app','sms','email')),
    notification_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    notification_status  VARCHAR(20) NOT NULL DEFAULT 'queued'
        CHECK (notification_status IN ('queued','sent','failed','skipped')),
    notification_error   TEXT,
    notification_sent_at TIMESTAMPTZ,
    notification_read_at TIMESTAMPTZ,
    notification_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_pending
    ON notifications (notification_status, notification_created_at)
    WHERE notification_status = 'queued';
CREATE INDEX idx_notifications_user
    ON notifications (user_id, notification_created_at DESC);

-- =====================================================================
-- 8. REVIEWS AND MODERATION   (requirement 2E)
-- =====================================================================

CREATE TABLE reviews (
    review_id       SERIAL PRIMARY KEY,
    vendor_id       INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users(user_id)     ON DELETE CASCADE,
    review_rating   SMALLINT NOT NULL CHECK (review_rating BETWEEN 1 AND 5),
    review_body     TEXT,
    review_status   VARCHAR(20) NOT NULL DEFAULT 'published'
        CHECK (review_status IN ('published','pending','hidden','removed')),
    review_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One review per account per business, preventing repeated submissions.
    UNIQUE (vendor_id, user_id)
);
CREATE INDEX idx_reviews_vendor ON reviews (vendor_id, review_status);

-- Polymorphic target, so the moderation queue remains a single list and
-- new reportable entities do not require additional tables.
CREATE TABLE reports (
    report_id          SERIAL PRIMARY KEY,
    report_target_type VARCHAR(20) NOT NULL
        CHECK (report_target_type IN ('vendor','listing','review','message')),
    report_target_id   INT NOT NULL,
    reporter_user_id   INT REFERENCES users(user_id) ON DELETE SET NULL,
    report_reason      VARCHAR(40) NOT NULL,
    report_details     TEXT,
    report_status      VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (report_status IN ('open','actioned','dismissed')),
    report_resolved_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    report_resolved_at TIMESTAMPTZ,
    report_created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reports_open ON reports (report_status, report_created_at DESC);

-- =====================================================================
-- 9. ANALYTICS   (requirement 2E: search trends and active user counts,
--                 reported in aggregate only)
-- =====================================================================

CREATE TABLE search_logs (
    search_id             BIGSERIAL PRIMARY KEY,
    search_query_raw      TEXT NOT NULL,
    -- Case-folded, punctuation-stripped form used for trend grouping.
    -- Normalisation must preserve combining marks: Bengali vowel signs and
    -- the hasant are marks rather than letters, and stripping them
    -- decomposes words into unmatchable characters.
    search_query_normalised TEXT NOT NULL,
    category_id           INT REFERENCES categories(category_id) ON DELETE SET NULL,
    location_id           INT REFERENCES locations(location_id)  ON DELETE SET NULL,
    search_result_count   INT NOT NULL DEFAULT 0,
    -- Salted, rotating hash. No raw address or account identifier is
    -- stored, so analytics remain aggregate.
    search_session_hash   CHAR(64),
    search_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_search_created    ON search_logs (search_created_at DESC);
CREATE INDEX idx_search_normalised ON search_logs (search_query_normalised);

CREATE TABLE vendor_profile_views (
    view_id           BIGSERIAL PRIMARY KEY,
    vendor_id         INT NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    listing_id        INT REFERENCES vendor_listings(listing_id) ON DELETE CASCADE,
    view_source       VARCHAR(20)
        CHECK (view_source IN ('search','category','direct','share','sponsored')),
    view_session_hash CHAR(64),
    view_created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_views_vendor ON vendor_profile_views (vendor_id, view_created_at DESC);

-- Records administrative actions that modify other users' data, so the
-- acting account and prior state remain auditable.
CREATE TABLE audit_logs (
    audit_id            BIGSERIAL PRIMARY KEY,
    audit_actor_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    audit_action        VARCHAR(60) NOT NULL,
    audit_target_type   VARCHAR(20) NOT NULL,
    audit_target_id     INT,
    audit_before        JSONB,
    audit_after         JSONB,
    audit_created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_logs (audit_created_at DESC);

-- ---------------------------------------------------------------------
-- Admin dashboard views
-- ---------------------------------------------------------------------

-- Daily search trends. Terms with fewer than five occurrences are
-- suppressed, as a low-frequency query combined with a narrow location can
-- identify an individual.
CREATE VIEW v_search_trends_daily AS
SELECT date_trunc('day', search_created_at)::date AS trend_day,
       search_query_normalised,
       COUNT(*)                                   AS trend_count,
       AVG(search_result_count)::numeric(10,2)    AS trend_avg_results
FROM   search_logs
GROUP  BY 1, 2
HAVING COUNT(*) >= 5;

CREATE VIEW v_active_users_daily AS
SELECT date_trunc('day', view_created_at)::date AS active_day,
       COUNT(DISTINCT view_session_hash)        AS active_sessions
FROM   vendor_profile_views
GROUP  BY 1;

-- Consolidated moderation queue across pending vendors, listings and reports.
CREATE VIEW v_moderation_queue AS
SELECT 'vendor'::text AS queue_type, v.vendor_id AS queue_target_id,
       v.vendor_name  AS queue_label, v.vendor_created_at AS queue_created_at
FROM   vendors v WHERE v.vendor_status = 'pending'
UNION ALL
SELECT 'listing', l.listing_id, l.listing_title, l.listing_created_at
FROM   vendor_listings l WHERE l.listing_status = 'pending'
UNION ALL
SELECT 'report', r.report_id, r.report_reason, r.report_created_at
FROM   reports r WHERE r.report_status = 'open';

COMMIT;
