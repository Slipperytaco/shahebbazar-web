-- =====================================================================
-- Shahebbazar -- seed v2.1: content for the finalized home page design
-- =====================================================================
--
-- seed.v2.sql provides the business-to-business sectors named in the
-- client scope. This file adds the consumer directory categories shown in
-- the approved designs: Medical, Tourism, Restaurants, Shopping,
-- Education and Services.
--
-- The platform serves both audiences, so this file extends rather than
-- replaces the earlier data.
--
-- All businesses and individuals are fictional sample data.
--
-- Run after schema.v2.sql, schema.v2.1.sql and seed.v2.sql.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Top-level categories shown on the home page.
-- Tile subtitles are derived from the first three child categories at
-- query time rather than stored, so they remain correct after taxonomy
-- changes.
-- ---------------------------------------------------------------------
UPDATE categories
SET category_name = 'Medical', category_name_bn = 'চিকিৎসা',
    category_sort_order = 10, category_icon = 'medical'
WHERE category_slug = 'health';

UPDATE categories
SET category_name = 'Tourism', category_name_bn = 'পর্যটন',
    category_sort_order = 20, category_icon = 'palm'
WHERE category_slug = 'tourism';

-- The home page renders the first six categories by sort order. Consumer
-- categories occupy 10-60; the business-to-business categories move to 70
-- and above and remain browsable through search.
UPDATE categories SET category_sort_order = 70  WHERE category_slug = 'silk-textiles';
UPDATE categories SET category_sort_order = 80  WHERE category_slug = 'handicrafts';
UPDATE categories SET category_sort_order = 90  WHERE category_slug = 'agro-supplies';
UPDATE categories SET category_sort_order = 100 WHERE category_slug = 'light-manufacturing';

INSERT INTO categories (category_parent_id, category_name, category_name_bn, category_slug, category_icon, category_sort_order) VALUES
    (NULL, 'Restaurants', 'রেস্তোরাঁ', 'restaurants', 'utensils', 30),
    (NULL, 'Shopping',    'কেনাকাটা',  'shopping',    'bag',      40),
    (NULL, 'Education',   'শিক্ষা',     'education',   'cap',      50),
    (NULL, 'Services',    'সেবা',       'services',    'wrench',   60);

INSERT INTO categories (category_parent_id, category_name, category_name_bn, category_slug, category_sort_order)
SELECT p.category_id, c.name, c.name_bn, c.slug, c.sort
FROM categories p
JOIN (VALUES
    ('health',      'Hospitals',   'হাসপাতাল',      'hospitals',    0),
    ('health',      'Clinics',     'ক্লিনিক',        'clinics',      1),
    ('tourism',     'Travel',      'ভ্রমণ',          'travel',       2),
    ('tourism',     'Attractions', 'দর্শনীয় স্থান',  'attractions',  3),
    ('restaurants', 'Food',        'খাবার',          'food',         0),
    ('restaurants', 'Cafes',       'ক্যাফে',         'cafes',        1),
    ('restaurants', 'Caterers',    'ক্যাটারার',      'caterers',     2),
    ('shopping',    'Malls',       'শপিং মল',       'malls',        0),
    ('shopping',    'Stores',      'দোকান',          'stores',       1),
    ('shopping',    'Boutiques',   'বুটিক',          'boutiques',    2),
    ('education',   'Schools',     'স্কুল',          'schools',      0),
    ('education',   'Coaching',    'কোচিং',          'coaching',     1),
    ('education',   'Colleges',    'কলেজ',           'colleges',     2),
    ('services',    'Salons',      'সেলুন',          'salons',       0),
    ('services',    'Plumbers',    'প্লাম্বার',       'plumbers',     1),
    ('services',    'Carpenters',  'কাঠমিস্ত্রি',     'carpenters',   2)
) AS c(parent_slug, name, name_bn, slug, sort)
  ON p.category_slug = c.parent_slug;

-- Existing medical subcategories are ordered after Hospitals and Clinics
-- so the derived tile subtitle matches the approved design.
UPDATE categories SET category_name = 'Pharmacies', category_sort_order = 2
WHERE category_slug = 'pharmacy';
UPDATE categories SET category_sort_order = 4 WHERE category_slug = 'diagnostic-centre';
UPDATE categories SET category_sort_order = 5 WHERE category_slug = 'doctor-chamber';
-- Orders the tourism subcategories to match the approved design.
UPDATE categories SET category_sort_order = 4 WHERE category_slug = 'tour-operators';
-- Shortened to fit the derived tile subtitle.
UPDATE categories SET category_name = 'Hotels', category_sort_order = 0
WHERE category_slug = 'hotels';

-- ---------------------------------------------------------------------
-- Owners for the consumer-side businesses
-- ---------------------------------------------------------------------
INSERT INTO users (user_phone, user_email, user_name, user_role, user_phone_verified_at) VALUES
    ('+8801711000010', NULL, 'Arif Hossain',    'vendor', NOW()),
    ('+8801711000011', NULL, 'Sabina Yeasmin',  'vendor', NOW()),
    ('+8801711000012', NULL, 'Kamrul Hasan',    'vendor', NOW()),
    ('+8801711000013', NULL, 'Nusrat Jahan',    'vendor', NOW()),
    ('+8801711000014', NULL, 'Mahfuzur Rahman', 'vendor', NOW());

-- ---------------------------------------------------------------------
-- Featured businesses shown on the home page
-- ---------------------------------------------------------------------
INSERT INTO vendors (
    user_id, vendor_name, vendor_name_bn, vendor_slug, vendor_description,
    vendor_phone, vendor_whatsapp, vendor_address, location_id,
    vendor_lat, vendor_lng, vendor_business_type, vendor_status,
    vendor_verified_at, vendor_is_featured, vendor_featured_until
)
SELECT u.user_id, v.name, v.name_bn, v.slug, v.descr,
       v.phone, v.phone, v.address, l.location_id,
       v.lat, v.lng, 'b2c', 'approved', NOW(), TRUE, NOW() + INTERVAL '60 days'
FROM (VALUES
    ('+8801711000010', 'Rajshahi Medical Centre', 'রাজশাহী মেডিকেল সেন্টার', 'rajshahi-medical-centre',
     'Multi-specialty hospital providing compassionate care with modern facilities and experienced doctors. Diagnostic, treatment and emergency services 24/7.',
     '+8801712345678', '123, Station Road, Rajshahi 6000', 'shaheb-bazar', 24.372100, 88.604400),

    ('+8801711000011', 'Padma View Restaurant', 'পদ্মা ভিউ রেস্টুরেন্ট', 'padma-view-restaurant',
     'A family-friendly restaurant offering a blend of traditional Bangladeshi and continental cuisine with a scenic view of the Padma.',
     '+8801712345679', 'Talaimari, Rajshahi 6000', 'talaimari', 24.366800, 88.629700),

    ('+8801711000012', 'Grand River View Hotel', 'গ্র্যান্ড রিভার ভিউ হোটেল', 'grand-river-view-hotel',
     'Elegant rooms, modern amenities and exceptional service with a beautiful view of the Padma River.',
     '+8801712345680', 'Laxmipur, Rajshahi 6000', 'laxmipur', 24.365900, 88.598400),

    ('+8801711000013', 'Rajshahi Craft Outlet', 'রাজশাহী ক্রাফট আউটলেট', 'rajshahi-craft-outlet',
     'Handloom clothing, leather goods and home decor from artisans across the Rajshahi division.',
     '+8801712345681', 'Shaheb Bazar Zero Point, Rajshahi', 'shaheb-bazar', 24.371200, 88.601900),

    ('+8801711000014', 'Digitax Accounting', 'ডিজিট্যাক্স অ্যাকাউন্টিং', 'digitax-accounting',
     'Bookkeeping, VAT registration and annual return filing for small businesses and sole traders in Rajshahi.',
     '+8801712345682', 'Upashahar, Rajshahi 6000', 'upashahar', 24.359200, 88.613100)
) AS v(owner_phone, name, name_bn, slug, descr, phone, address, area_slug, lat, lng)
JOIN users     u ON u.user_phone    = v.owner_phone
JOIN locations l ON l.location_slug = v.area_slug;

UPDATE vendors v SET vendor_verified_by = (SELECT user_id FROM users WHERE user_role = 'admin')
WHERE v.vendor_verified_by IS NULL AND v.vendor_status = 'approved';

INSERT INTO vendor_categories (vendor_id, category_id)
SELECT v.vendor_id, c.category_id
FROM (VALUES
    ('rajshahi-medical-centre', 'hospitals'),
    ('rajshahi-medical-centre', 'diagnostic-centre'),
    ('padma-view-restaurant',   'food'),
    ('grand-river-view-hotel',  'hotels'),
    ('rajshahi-craft-outlet',   'stores'),
    ('rajshahi-craft-outlet',   'boutiques'),
    ('digitax-accounting',      'services')
) AS m(vendor_slug, category_slug)
JOIN vendors    v ON v.vendor_slug   = m.vendor_slug
JOIN categories c ON c.category_slug = m.category_slug;

-- Cover images, referencing the sample files in backend/uploads/ so the
-- featured cards render photographs rather than placeholders.
UPDATE vendors v SET vendor_cover_url = c.url
FROM (VALUES
    ('rajshahi-medical-centre', 'uploads/1788451854562-688168547.jpg'),
    ('padma-view-restaurant',   'uploads/1788453621026-466847301.jpg'),
    ('grand-river-view-hotel',  'uploads/1788454922883-1396819.jpg'),
    ('rajshahi-craft-outlet',   'uploads/1788455110818-348770521.jpg'),
    ('digitax-accounting',      'uploads/1788456632248-187962939.jpg')
) AS c(slug, url)
WHERE v.vendor_slug = c.slug;

-- ---------------------------------------------------------------------
-- Opening hours
--
-- Default hours are applied to all approved vendors, then overridden for
-- businesses operating continuously or later.
-- ---------------------------------------------------------------------
INSERT INTO vendor_opening_hours (vendor_id, hours_day_of_week, hours_open_time, hours_close_time)
SELECT v.vendor_id, d, TIME '09:00', TIME '22:00'
FROM vendors v
CROSS JOIN generate_series(0, 6) AS d
WHERE v.vendor_status = 'approved'
ON CONFLICT (vendor_id, hours_day_of_week) DO NOTHING;

UPDATE vendor_opening_hours
SET hours_is_24h = TRUE, hours_open_time = NULL, hours_close_time = NULL
WHERE vendor_id = (SELECT vendor_id FROM vendors WHERE vendor_slug = 'rajshahi-medical-centre');

UPDATE vendor_opening_hours SET hours_close_time = TIME '23:00'
WHERE vendor_id IN (SELECT vendor_id FROM vendors
                    WHERE vendor_slug IN ('padma-view-restaurant','grand-river-view-hotel'));

-- ---------------------------------------------------------------------
-- Reviews
--
-- Ratings are derived by v_business_cards rather than stored, so review
-- rows are required to produce representative averages. Forty synthetic
-- reviewers are seeded with a distribution weighted towards higher
-- ratings.
-- ---------------------------------------------------------------------
INSERT INTO users (user_phone, user_name, user_role, user_phone_verified_at)
SELECT '+88019' || LPAD(g::text, 8, '0'), 'Sample Reviewer ' || g, 'customer', NOW()
FROM generate_series(1, 40) AS g;

INSERT INTO reviews (vendor_id, user_id, review_rating, review_body, review_status)
SELECT v.vendor_id,
       u.user_id,
       -- Deterministic distribution across ratings three to five.
       CASE WHEN (u.user_id + v.vendor_id) % 10 < 6 THEN 5
            WHEN (u.user_id + v.vendor_id) % 10 < 9 THEN 4
            ELSE 3 END,
       NULL,
       'published'
FROM vendors v
JOIN LATERAL (
    SELECT user_id FROM users
    WHERE user_name LIKE 'Sample Reviewer %'
    ORDER BY user_id
    -- A different slice per vendor, so review counts differ.
    LIMIT 14 + (v.vendor_id % 17) OFFSET (v.vendor_id % 6)
) u ON TRUE
WHERE v.vendor_status = 'approved'
ON CONFLICT (vendor_id, user_id) DO NOTHING;


-- ---------------------------------------------------------------------
-- Events, dated relative to NOW() so the upcoming list is never empty.
-- ---------------------------------------------------------------------
INSERT INTO events (event_title, event_title_bn, event_slug, event_description,
                    event_venue, location_id, event_starts_at, event_ends_at)
SELECT e.title, e.title_bn, e.slug, e.descr, e.venue, l.location_id,
       NOW() + (e.starts_in || ' days')::interval,
       NOW() + (e.ends_in   || ' days')::interval
FROM (VALUES
    ('Rajshahi Food Festival', 'রাজশাহী খাদ্য উৎসব', 'rajshahi-food-festival',
     'Three days of street food, regional sweets and live cooking from vendors across the division.',
     'Bagha, Rajshahi', 'shaheb-bazar', 12, 15),
    ('Padma River Festival', 'পদ্মা নদী উৎসব', 'padma-river-festival',
     'Boat races, folk music and a riverside craft market along the Padma embankment.',
     'Padma Garden', 'talaimari', 26, 26),
    ('Rajshahi Book Fair', 'রাজশাহী বইমেলা', 'rajshahi-book-fair',
     'Ten days of publishers, readings and children''s workshops at the Central Library ground.',
     'Central Library Ground', 'laxmipur', 40, 49),
    ('Silk City Trade Expo', 'সিল্ক সিটি বাণিজ্য মেলা', 'silk-city-trade-expo',
     'B2B expo for silk weavers, handicraft producers and agro-suppliers to meet wholesale buyers.',
     'Rajshahi Chamber of Commerce', 'shaheb-bazar', 55, 58)
) AS e(title, title_bn, slug, descr, venue, area_slug, starts_in, ends_in)
JOIN locations l ON l.location_slug = e.area_slug;

-- ---------------------------------------------------------------------
-- Popular searches
--
-- Popular search terms are read from v_search_trends_daily, which
-- suppresses terms with fewer than five occurrences. Nine rows per term
-- place these above both the threshold and the earlier seeded terms.
-- ---------------------------------------------------------------------
INSERT INTO search_logs (search_query_raw, search_query_normalised, category_id,
                         search_result_count, search_session_hash, search_created_at)
SELECT q.term, lower(q.term), c.category_id, q.results,
       encode(sha256((q.term || g)::bytea), 'hex'),
       NOW() - (g || ' hours')::interval
FROM (VALUES
    ('Physiotherapy',     'doctor-chamber',    14),
    ('Gyms',              'services',           9),
    ('Beauty Parlour',    'salons',            21),
    ('Car Workshop',      'services',          11),
    ('Diagnostic Center', 'diagnostic-centre', 24),
    ('Tuition',           'coaching',          31),
    ('Cafes',             'cafes',             17),
    ('Electronics',       'stores',            19)
) AS q(term, category_slug, results)
JOIN categories c ON c.category_slug = q.category_slug
CROSS JOIN generate_series(1, 9) AS g;

COMMIT;
