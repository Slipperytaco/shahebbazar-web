-- =====================================================================
-- Shahebbazar -- seed data (v2)
-- =====================================================================
--
-- Sample merchant data covering the sectors named in the client scope:
-- silk, handicrafts, agro-supplies and light manufacturing, together with
-- tourism and health.
--
-- All businesses, individuals and telephone numbers are fictional and are
-- provided for development and demonstration only.
--
-- Run after schema.v2.sql. Rows are inserted by slug lookup rather than
-- hard-coded identifiers, so the file remains correct if partially re-run.
--
-- Bangla values are included so the search normaliser and the bilingual
-- interface can be exercised against non-Latin data.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Locations: country > division > district > city > area.
-- A second division is seeded without merchants to demonstrate that the
-- hierarchy supports expansion without a schema change.
-- ---------------------------------------------------------------------
INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path) VALUES
    (NULL, 'Bangladesh', 'বাংলাদেশ', 'country', 'bd', 'bd');

INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path)
SELECT location_id, 'Rajshahi Division', 'রাজশাহী বিভাগ', 'division', 'rajshahi-division', location_path || '/rajshahi-division'
FROM locations WHERE location_slug = 'bd';

INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path)
SELECT location_id, 'Sylhet Division', 'সিলেট বিভাগ', 'division', 'sylhet-division', location_path || '/sylhet-division'
FROM locations WHERE location_slug = 'bd';

INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path)
SELECT location_id, 'Rajshahi District', 'রাজশাহী জেলা', 'district', 'rajshahi-district', location_path || '/rajshahi-district'
FROM locations WHERE location_slug = 'rajshahi-division';

INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path)
SELECT location_id, 'Rajshahi City', 'রাজশাহী শহর', 'city', 'rajshahi-city', location_path || '/rajshahi-city'
FROM locations WHERE location_slug = 'rajshahi-district';

INSERT INTO locations (location_parent_id, location_name, location_name_bn, location_type, location_slug, location_path)
SELECT l.location_id, a.name, a.name_bn, 'area', a.slug, l.location_path || '/' || a.slug
FROM locations l
CROSS JOIN (VALUES
    ('Shaheb Bazar', 'সাহেব বাজার', 'shaheb-bazar'),
    ('Laxmipur',     'লক্ষ্মীপুর',   'laxmipur'),
    ('Kazla',        'কাজলা',       'kazla'),
    ('Talaimari',    'তালাইমারী',   'talaimari'),
    ('Binodpur',     'বিনোদপুর',    'binodpur'),
    ('Upashahar',    'উপশহর',       'upashahar'),
    ('Naodapara',    'নওদাপাড়া',    'naodapara')
) AS a(name, name_bn, slug)
WHERE l.location_slug = 'rajshahi-city';

-- ---------------------------------------------------------------------
-- Categories -- top level then children
-- ---------------------------------------------------------------------
INSERT INTO categories (category_parent_id, category_name, category_name_bn, category_slug, category_icon, category_sort_order) VALUES
    (NULL, 'Silk & Textiles',      'সিল্ক ও বস্ত্র',        'silk-textiles',      'shirt',    10),
    (NULL, 'Handicrafts',          'হস্তশিল্প',             'handicrafts',        'palette',  20),
    (NULL, 'Agro Supplies',        'কৃষি সরঞ্জাম',          'agro-supplies',      'sprout',   30),
    (NULL, 'Light Manufacturing',  'হালকা প্রকৌশল',         'light-manufacturing','factory',  40),
    (NULL, 'Health',               'স্বাস্থ্য',              'health',             'heart',    50),
    (NULL, 'Tourism & Hospitality','পর্যটন ও আতিথেয়তা',    'tourism',            'map-pin',  60);

INSERT INTO categories (category_parent_id, category_name, category_name_bn, category_slug, category_sort_order)
SELECT p.category_id, c.name, c.name_bn, c.slug, c.sort
FROM categories p
JOIN (VALUES
    ('silk-textiles',       'Silk Sarees',          'সিল্ক শাড়ি',        'silk-sarees',        1),
    ('silk-textiles',       'Raw Silk & Yarn',      'কাঁচা সিল্ক ও সুতা', 'raw-silk-yarn',      2),
    ('silk-textiles',       'Tailoring',            'দর্জি',              'tailoring',          3),
    ('handicrafts',         'Jute Products',        'পাটজাত পণ্য',       'jute-products',      1),
    ('handicrafts',         'Bamboo & Cane',        'বাঁশ ও বেত',        'bamboo-cane',        2),
    ('handicrafts',         'Pottery',              'মৃৎশিল্প',           'pottery',            3),
    ('agro-supplies',       'Seeds & Fertiliser',   'বীজ ও সার',         'seeds-fertiliser',   1),
    ('agro-supplies',       'Mango & Fruit Trade',  'আম ও ফল ব্যবসা',    'mango-fruit-trade',  2),
    ('agro-supplies',       'Farm Machinery',       'কৃষি যন্ত্রপাতি',    'farm-machinery',     3),
    ('light-manufacturing', 'Metal Fabrication',    'ধাতব নির্মাণ',       'metal-fabrication',  1),
    ('light-manufacturing', 'Plastic & Packaging',  'প্লাস্টিক ও প্যাকেজিং','plastic-packaging',2),
    ('health',              'Pharmacy',             'ফার্মেসি',           'pharmacy',           1),
    ('health',              'Diagnostic Centre',    'ডায়াগনস্টিক সেন্টার','diagnostic-centre',  2),
    ('health',              'Doctor Chamber',       'ডাক্তারের চেম্বার',  'doctor-chamber',     3),
    ('tourism',             'Hotels & Guest Houses','হোটেল ও গেস্ট হাউস','hotels',             1),
    ('tourism',             'Tour Operators',       'ট্যুর অপারেটর',      'tour-operators',     2)
) AS c(parent_slug, name, name_bn, slug, sort)
  ON p.category_slug = c.parent_slug;

-- ---------------------------------------------------------------------
-- Users
--
-- user_password_hash below is a DEV-ONLY bcrypt hash of the string
-- "Password123!". Never ship it. Real accounts sign in by phone OTP and
-- carry NULL here; the hash exists only so the seeded admin can log in
-- before the SMS driver is wired up.
-- ---------------------------------------------------------------------
INSERT INTO users (user_phone, user_email, user_name, user_password_hash, user_role, user_phone_verified_at) VALUES
    ('+8801711000001', 'admin@shahebbazar.com', 'Platform Admin',
     '$2b$12$Xk9uJmQx0v0hFqUeR7bF9uYt3WcHfPjLmN2sQ8vZaD5eK1gT4rC6y', 'admin', NOW()),
    ('+8801711000002', NULL, 'Rafiqul Islam',  NULL, 'vendor', NOW()),
    ('+8801711000003', NULL, 'Nasrin Akter',   NULL, 'vendor', NOW()),
    ('+8801711000004', NULL, 'Abdul Karim',    NULL, 'vendor', NOW()),
    ('+8801711000005', NULL, 'Shahidul Haque', NULL, 'vendor', NOW()),
    ('+8801711000006', NULL, 'Momena Begum',   NULL, 'vendor', NOW()),
    ('+8801711000007', NULL, 'Jahangir Alam',  NULL, 'vendor', NOW()),
    ('+8801711000008', NULL, 'Tanvir Hossain', NULL, 'vendor', NOW()),
    ('+8801711000009', NULL, 'Selina Parvin',  NULL, 'vendor', NOW()),
    ('+8801722000001', NULL, 'Imran Chowdhury', NULL, 'customer', NOW()),
    ('+8801722000002', NULL, 'Farhana Yasmin',  NULL, 'customer', NOW());

-- ---------------------------------------------------------------------
-- Vendors: eight approved, one pending and one rejected, so the
-- moderation queue is populated on first load.
-- ---------------------------------------------------------------------
INSERT INTO vendors (
    user_id, vendor_name, vendor_name_bn, vendor_slug, vendor_description,
    vendor_phone, vendor_whatsapp, vendor_address, location_id,
    vendor_lat, vendor_lng, vendor_business_type, vendor_status,
    vendor_verified_at, vendor_is_featured
)
SELECT u.user_id, v.name, v.name_bn, v.slug, v.descr,
       v.phone, v.phone, v.address, l.location_id,
       v.lat, v.lng, v.btype, v.status,
       CASE WHEN v.status = 'approved' THEN NOW() END,
       v.featured
FROM (VALUES
    ('+8801711000002', 'Shaheb Bazar Silk House', 'সাহেব বাজার সিল্ক হাউস', 'shaheb-bazar-silk-house',
     'Hand-loom and power-loom silk sarees woven in Rajshahi. Wholesale and retail, custom orders accepted.',
     '+8801711000002', 'Zero Point, Shaheb Bazar, Rajshahi', 'shaheb-bazar',
     24.371500, 88.601200, 'both', 'approved', TRUE),

    ('+8801711000003', 'Padma Handicrafts', 'পদ্মা হস্তশিল্প', 'padma-handicrafts',
     'Jute bags, bamboo baskets and cane furniture made by a women-led artisan group. Bulk export orders welcome.',
     '+8801711000003', 'Laxmipur More, Rajshahi', 'laxmipur',
     24.365400, 88.597800, 'both', 'approved', FALSE),

    ('+8801711000004', 'Barind Agro Supplies', 'বরেন্দ্র কৃষি সরঞ্জাম', 'barind-agro-supplies',
     'Certified seed, fertiliser and pesticide for the Barind tract. Supplies to farmer co-operatives across Rajshahi district.',
     '+8801711000004', 'Naodapara Bazar, Rajshahi', 'naodapara',
     24.400100, 88.632400, 'b2b', 'approved', FALSE),

    ('+8801711000005', 'Rajshahi Mango Traders', 'রাজশাহী আম ব্যবসায়ী', 'rajshahi-mango-traders',
     'Seasonal wholesale of Khirsapat, Langra and Fazli mango. Carbide-free, packed and shipped nationwide.',
     '+8801711000005', 'Shaheb Bazar Road, Rajshahi', 'shaheb-bazar',
     24.372800, 88.603500, 'b2b', 'approved', TRUE),

    ('+8801711000006', 'Uttara Light Engineering', 'উত্তরা লাইট ইঞ্জিনিয়ারিং', 'uttara-light-engineering',
     'Metal fabrication, grill work, water tank stands and small machine parts. Job work for local manufacturers.',
     '+8801711000006', 'Kazla, Rajshahi', 'kazla',
     24.363900, 88.638200, 'b2b', 'approved', FALSE),

    ('+8801711000007', 'Green Life Pharmacy', 'গ্রীন লাইফ ফার্মেসি', 'green-life-pharmacy',
     'Licensed pharmacy open until midnight. Prescription medicine, diabetic supplies and home delivery within the city.',
     '+8801711000007', 'Talaimari More, Rajshahi', 'talaimari',
     24.367200, 88.628900, 'b2c', 'approved', FALSE),

    ('+8801711000008', 'Padma Diagnostic Centre', 'পদ্মা ডায়াগনস্টিক সেন্টার', 'padma-diagnostic-centre',
     'Pathology, ultrasound and X-ray with on-site consultant chambers. Reports the same day.',
     '+8801711000008', 'Binodpur Bazar, Rajshahi', 'binodpur',
     24.369100, 88.641500, 'b2c', 'approved', FALSE),

    ('+8801711000009', 'Padma Garden Tours', 'পদ্মা গার্ডেন ট্যুরস', 'padma-garden-tours',
     'Day trips to Puthia temple complex, Varendra Museum and the Padma embankment. Guides in Bangla and English.',
     '+8801711000009', 'Upashahar, Rajshahi', 'upashahar',
     24.358700, 88.612300, 'b2c', 'approved', FALSE),

    -- Pending approval; appears in v_moderation_queue.
    ('+8801711000002', 'Shaheb Bazar Cloth Store', 'সাহেব বাজার কাপড় স্টোর', 'shaheb-bazar-cloth-store',
     'Second shop of the same owner, submitted and not yet reviewed.',
     '+8801711000002', 'Shaheb Bazar, Rajshahi', 'shaheb-bazar',
     24.371900, 88.602100, 'b2c', 'pending', FALSE),

    -- Rejected, exercising the rejection path.
    ('+8801711000003', 'Quick Cash Loans BD', 'কুইক ক্যাশ লোন বিডি', 'quick-cash-loans-bd',
     'Rejected sample: unlicensed lending, outside the platform categories.',
     '+8801711000003', 'Unknown', 'laxmipur',
     24.365000, 88.597000, 'b2c', 'rejected', FALSE)
) AS v(owner_phone, name, name_bn, slug, descr, phone, address, area_slug,
       lat, lng, btype, status, featured)
JOIN users     u ON u.user_phone   = v.owner_phone
JOIN locations l ON l.location_slug = v.area_slug;

UPDATE vendors SET vendor_rejection_reason = 'Financial services are out of scope for Phase 1.'
WHERE vendor_slug = 'quick-cash-loans-bd';

UPDATE vendors v SET vendor_verified_by = (SELECT user_id FROM users WHERE user_role = 'admin')
WHERE v.vendor_status = 'approved';

UPDATE vendors SET vendor_featured_until = NOW() + INTERVAL '30 days'
WHERE vendor_is_featured;

-- ---------------------------------------------------------------------
-- Vendor <-> category
-- ---------------------------------------------------------------------
INSERT INTO vendor_categories (vendor_id, category_id)
SELECT v.vendor_id, c.category_id
FROM (VALUES
    ('shaheb-bazar-silk-house',   'silk-sarees'),
    ('shaheb-bazar-silk-house',   'raw-silk-yarn'),
    ('padma-handicrafts',         'jute-products'),
    ('padma-handicrafts',         'bamboo-cane'),
    ('barind-agro-supplies',      'seeds-fertiliser'),
    ('barind-agro-supplies',      'farm-machinery'),
    ('rajshahi-mango-traders',    'mango-fruit-trade'),
    ('uttara-light-engineering',  'metal-fabrication'),
    ('green-life-pharmacy',       'pharmacy'),
    ('padma-diagnostic-centre',   'diagnostic-centre'),
    ('padma-diagnostic-centre',   'doctor-chamber'),
    ('padma-garden-tours',        'tour-operators'),
    ('shaheb-bazar-cloth-store',  'silk-sarees')
) AS m(vendor_slug, category_slug)
JOIN vendors    v ON v.vendor_slug   = m.vendor_slug
JOIN categories c ON c.category_slug = m.category_slug;

-- ---------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------
INSERT INTO vendor_listings (
    vendor_id, category_id, listing_title, listing_title_bn, listing_slug,
    listing_description, listing_price, listing_price_max, listing_price_unit,
    listing_min_order_qty, listing_is_negotiable, listing_status
)
SELECT v.vendor_id, c.category_id, x.title, x.title_bn, x.slug,
       x.descr, x.price, x.price_max, x.unit, x.moq, x.negotiable, x.status
FROM (VALUES
    ('shaheb-bazar-silk-house', 'silk-sarees', 'Katan Silk Saree', 'কাতান সিল্ক শাড়ি', 'katan-silk-saree',
     'Pure Rajshahi katan silk with zari border. Available in twelve colours, custom blouse piece included.',
     3500.00, 9000.00, 'piece', 1, TRUE, 'approved'),
    ('shaheb-bazar-silk-house', 'silk-sarees', 'Block Print Silk Saree', 'ব্লক প্রিন্ট সিল্ক শাড়ি', 'block-print-silk-saree',
     'Hand block printed on mulberry silk. Wholesale rate applies from twenty pieces.',
     1800.00, 2600.00, 'piece', 20, TRUE, 'approved'),
    ('shaheb-bazar-silk-house', 'raw-silk-yarn', 'Mulberry Raw Silk Yarn', 'তুঁত কাঁচা সিল্ক সুতা', 'mulberry-raw-silk-yarn',
     'Reeled mulberry yarn, 20/22 denier, sold by the kilogram to weavers.',
     4200.00, NULL, 'kg', 5, TRUE, 'approved'),

    ('padma-handicrafts', 'jute-products', 'Jute Shopping Bag', 'পাটের শপিং ব্যাগ', 'jute-shopping-bag',
     'Laminated jute bag with cotton handle. Screen printing available for bulk orders.',
     120.00, 260.00, 'piece', 100, TRUE, 'approved'),
    ('padma-handicrafts', 'bamboo-cane', 'Cane Storage Basket', 'বেতের ঝুড়ি', 'cane-storage-basket',
     'Woven cane basket in three sizes, natural or lacquered finish.',
     450.00, 1100.00, 'piece', 10, TRUE, 'approved'),

    ('barind-agro-supplies', 'seeds-fertiliser', 'BRRI Dhan-28 Certified Seed', 'ব্রি ধান-২৮ বীজ', 'brri-dhan-28-seed',
     'Government certified boro paddy seed, current season lot with germination certificate.',
     78.00, NULL, 'kg', 40, FALSE, 'approved'),
    ('barind-agro-supplies', 'farm-machinery', 'Power Tiller Blade Set', 'পাওয়ার টিলার ব্লেড সেট', 'power-tiller-blade-set',
     'Hardened blade set fitting common 12 HP tillers. Fits Dongfeng and Sifang units.',
     3200.00, 3900.00, 'set', 2, TRUE, 'approved'),

    ('rajshahi-mango-traders', 'mango-fruit-trade', 'Khirsapat Mango (Himsagar)', 'খিরসাপাত আম', 'khirsapat-mango',
     'Carbide-free Khirsapat picked to order in season. Packed in ventilated crates, courier arranged.',
     2800.00, 4200.00, 'maund', 1, TRUE, 'approved'),
    ('rajshahi-mango-traders', 'mango-fruit-trade', 'Fazli Mango Wholesale', 'ফজলি আম পাইকারি', 'fazli-mango-wholesale',
     'Late-season Fazli for wholesale buyers. Minimum five maund per consignment.',
     2200.00, 3000.00, 'maund', 5, TRUE, 'approved'),

    ('uttara-light-engineering', 'metal-fabrication', 'MS Grill Fabrication', 'এমএস গ্রিল তৈরি', 'ms-grill-fabrication',
     'Mild steel window and balcony grill, made to measure. Rate per square foot including paint.',
     280.00, 420.00, 'sq ft', 50, TRUE, 'approved'),
    ('uttara-light-engineering', 'metal-fabrication', 'Water Tank Stand', 'পানির ট্যাংক স্ট্যান্ড', 'water-tank-stand',
     'Angle iron stand for 500 to 1500 litre tanks, galvanised finish, installed on site.',
     9500.00, 18000.00, 'unit', 1, TRUE, 'approved'),

    ('green-life-pharmacy', 'pharmacy', 'Home Delivery of Prescription Medicine', 'ওষুধ হোম ডেলিভারি', 'medicine-home-delivery',
     'Send a prescription photo and receive delivery inside Rajshahi city within two hours. Free above 500 taka.',
     NULL, NULL, NULL, NULL, FALSE, 'approved'),
    ('green-life-pharmacy', 'pharmacy', 'Diabetic Care Supplies', 'ডায়াবেটিস সামগ্রী', 'diabetic-care-supplies',
     'Glucometers, test strips, lancets and insulin syringes kept in cold chain.',
     650.00, 4500.00, 'item', 1, FALSE, 'approved'),

    ('padma-diagnostic-centre', 'diagnostic-centre', 'Full Blood Count (CBC)', 'সিবিসি পরীক্ষা', 'full-blood-count',
     'Complete blood count with report the same day. No appointment needed.',
     400.00, NULL, 'test', 1, FALSE, 'approved'),
    ('padma-diagnostic-centre', 'diagnostic-centre', 'Ultrasonogram of Whole Abdomen', 'পেটের আল্ট্রাসনোগ্রাম', 'ultrasonogram-whole-abdomen',
     'Performed by a consultant radiologist. Morning and evening slots.',
     1200.00, NULL, 'scan', 1, FALSE, 'approved'),

    ('padma-garden-tours', 'tour-operators', 'Puthia Temple Day Tour', 'পুঠিয়া রাজবাড়ি ভ্রমণ', 'puthia-temple-day-tour',
     'Air-conditioned microbus, guide and lunch. Departs Shaheb Bazar at 8am, returns by 6pm.',
     1500.00, 2200.00, 'person', 4, TRUE, 'approved'),
    ('padma-garden-tours', 'tour-operators', 'Padma River Sunset Boat Trip', 'পদ্মা নদীতে নৌভ্রমণ', 'padma-sunset-boat-trip',
     'Two-hour engine boat trip with snacks and life jackets. Family and group rates.',
     800.00, 1200.00, 'person', 6, TRUE, 'approved'),

    -- Pending listing on an approved shop -- second row in the moderation queue.
    ('shaheb-bazar-silk-house', 'tailoring', 'Custom Blouse Stitching', 'ব্লাউজ সেলাই', 'custom-blouse-stitching',
     'Submitted for review, not yet approved by an admin.',
     350.00, 700.00, 'piece', 1, TRUE, 'pending')
) AS x(vendor_slug, category_slug, title, title_bn, slug, descr,
       price, price_max, unit, moq, negotiable, status)
JOIN vendors    v ON v.vendor_slug   = x.vendor_slug
JOIN categories c ON c.category_slug = x.category_slug;

-- ---------------------------------------------------------------------
-- Photos
--
-- References the sample images in backend/uploads/, so seeded listings
-- resolve to real files.
-- ---------------------------------------------------------------------
INSERT INTO listing_photos (listing_id, photo_url, photo_alt_text, photo_sort_order, photo_is_primary)
SELECT l.listing_id, p.url, p.alt, 0, TRUE
FROM (VALUES
    ('katan-silk-saree',        'uploads/1788451854562-688168547.jpg',  'Katan silk saree with zari border'),
    ('jute-shopping-bag',       'uploads/1788453621026-466847301.jpg',  'Laminated jute shopping bag'),
    ('khirsapat-mango',         'uploads/1788454922883-1396819.jpg',    'Crate of Khirsapat mangoes'),
    ('ms-grill-fabrication',    'uploads/1788455110818-348770521.jpg',  'Mild steel window grill'),
    ('puthia-temple-day-tour',  'uploads/1788456632248-187962939.jpg',  'Puthia temple complex')
) AS p(listing_slug, url, alt)
JOIN vendor_listings l ON l.listing_slug = p.listing_slug;

-- ---------------------------------------------------------------------
-- Quote requests in three states (open, quoted, accepted) so every status
-- is represented.
-- ---------------------------------------------------------------------
INSERT INTO quote_requests (
    rfq_public_ref, user_id, rfq_contact_name, rfq_contact_phone,
    vendor_id, listing_id, category_id, rfq_title, rfq_details,
    rfq_quantity, rfq_unit, rfq_target_price, rfq_needed_by,
    rfq_delivery_location_id, rfq_status, rfq_expires_at
)
SELECT r.ref, u.user_id, u.user_name, u.user_phone,
       v.vendor_id, l.listing_id, c.category_id, r.title, r.details,
       r.qty, r.unit, r.target, r.needed_by::date,
       loc.location_id, r.status, NOW() + INTERVAL '14 days'
FROM (VALUES
    ('RFQ-8F3K2Q', '+8801722000001', 'shaheb-bazar-silk-house', 'katan-silk-saree', 'silk-sarees',
     'Bulk katan sarees for a boutique', 'Looking for 60 pieces across mixed colours for a Dhaka boutique. Need a proforma invoice.',
     60, 'piece', 3200.00, '2026-10-15', 'shaheb-bazar', 'quoted'),
    ('RFQ-2M7P4X', '+8801722000002', 'rajshahi-mango-traders', 'fazli-mango-wholesale', 'mango-fruit-trade',
     'Fazli mango, ten maund', 'Ten maund for a retail shop in Chattogram. Please quote including courier.',
     10, 'maund', 2400.00, '2026-09-25', 'shaheb-bazar', 'accepted'),
    ('RFQ-9T1V6B', '+8801722000001', 'uttara-light-engineering', 'ms-grill-fabrication', 'metal-fabrication',
     'Grill work for a three storey building', 'About 900 square feet of window grill. Site visit required before quoting.',
     900, 'sq ft', 300.00, '2026-11-01', 'kazla', 'open')
) AS r(ref, buyer_phone, vendor_slug, listing_slug, category_slug,
       title, details, qty, unit, target, needed_by, delivery_area, status)
JOIN users           u   ON u.user_phone      = r.buyer_phone
JOIN vendors         v   ON v.vendor_slug     = r.vendor_slug
JOIN vendor_listings l   ON l.listing_slug    = r.listing_slug
JOIN categories      c   ON c.category_slug   = r.category_slug
JOIN locations       loc ON loc.location_slug = r.delivery_area;

INSERT INTO quote_responses (
    rfq_id, vendor_id, quote_price, quote_lead_time_days,
    quote_payment_terms, quote_notes, quote_valid_until, quote_status
)
SELECT q.rfq_id, q.vendor_id, x.price, x.lead_days,
       x.terms, x.notes, (NOW() + INTERVAL '10 days')::date, x.status
FROM (VALUES
    ('RFQ-8F3K2Q', 3400.00, 12, 'partial_advance',
     'Rate held for 60 pieces. Thirty percent advance, balance on delivery. Proforma invoice attached by email.', 'sent'),
    ('RFQ-2M7P4X', 2650.00,  4, 'cash_on_delivery',
     'Includes crate and courier to Chattogram. Price moves with the daily market rate after this week.', 'accepted')
) AS x(ref, price, lead_days, terms, notes, status)
JOIN quote_requests q ON q.rfq_public_ref = x.ref;

-- ---------------------------------------------------------------------
-- Reviews covering the published, pending and reported states
-- ---------------------------------------------------------------------
INSERT INTO reviews (vendor_id, user_id, review_rating, review_body, review_status)
SELECT v.vendor_id, u.user_id, r.rating, r.body, r.status
FROM (VALUES
    ('shaheb-bazar-silk-house', '+8801722000001', 5,
     'Genuine Rajshahi silk and the owner explained the difference between katan and tangail properly. Delivered in a week.', 'published'),
    ('rajshahi-mango-traders',  '+8801722000002', 4,
     'Mangoes arrived ripe and undamaged. Courier was a day late but they called ahead.', 'published'),
    ('green-life-pharmacy',     '+8801722000001', 5,
     'Open late and delivered insulin at 11pm. Awaiting moderation.', 'pending'),
    ('padma-diagnostic-centre', '+8801722000002', 1,
     'Sample review flagged by the shop as a fake posting from a competitor.', 'published')
) AS r(vendor_slug, reviewer_phone, rating, body, status)
JOIN vendors v ON v.vendor_slug = r.vendor_slug
JOIN users   u ON u.user_phone  = r.reviewer_phone;

INSERT INTO reports (report_target_type, report_target_id, reporter_user_id,
                     report_reason, report_details, report_status)
SELECT 'review', rv.review_id, v.user_id, 'fake_review',
       'Shop owner reports this account has never been a customer.', 'open'
FROM reviews rv
JOIN vendors v ON v.vendor_id = rv.vendor_id
WHERE v.vendor_slug = 'padma-diagnostic-centre' AND rv.review_rating = 1;

-- ---------------------------------------------------------------------
-- Search logs. Each term is seeded above the five-event suppression
-- threshold applied by v_search_trends_daily.
-- ---------------------------------------------------------------------
INSERT INTO search_logs (search_query_raw, search_query_normalised, category_id,
                         search_result_count, search_session_hash, search_created_at)
SELECT q.raw, q.norm, c.category_id, q.results,
       encode(sha256((q.raw || g)::bytea), 'hex'),
       NOW() - (g || ' hours')::interval
FROM (VALUES
    ('Silk saree',   'silk saree',   'silk-sarees',       12),
    ('সিল্ক শাড়ি',    'সিল্ক শাড়ি',    'silk-sarees',       12),
    ('mango',        'mango',        'mango-fruit-trade',  8),
    ('আম',           'আম',           'mango-fruit-trade',  8),
    ('ডাক্তার',       'ডাক্তার',       'doctor-chamber',     3),
    ('pharmacy',     'pharmacy',     'pharmacy',           5),
    ('jute bag',     'jute bag',     'jute-products',      4),
    ('grill',        'grill',        'metal-fabrication',  2)
) AS q(raw, norm, category_slug, results)
JOIN categories c ON c.category_slug = q.category_slug
CROSS JOIN generate_series(1, 7) AS g;

INSERT INTO vendor_profile_views (vendor_id, view_source, view_session_hash, view_created_at)
SELECT v.vendor_id,
       (ARRAY['search','category','direct','share'])[1 + (g % 4)],
       encode(sha256((v.vendor_slug || g)::bytea), 'hex'),
       NOW() - (g || ' hours')::interval
FROM vendors v
CROSS JOIN generate_series(1, 9) AS g
WHERE v.vendor_status = 'approved';

COMMIT;

-- ---------------------------------------------------------------------
-- Verification query; run after loading.
-- ---------------------------------------------------------------------
-- SELECT 'locations' t, COUNT(*) FROM locations
-- UNION ALL SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL SELECT 'users', COUNT(*) FROM users
-- UNION ALL SELECT 'vendors', COUNT(*) FROM vendors
-- UNION ALL SELECT 'listings', COUNT(*) FROM vendor_listings
-- UNION ALL SELECT 'rfq', COUNT(*) FROM quote_requests
-- UNION ALL SELECT 'quotes', COUNT(*) FROM quote_responses
-- UNION ALL SELECT 'moderation queue', COUNT(*) FROM v_moderation_queue;
