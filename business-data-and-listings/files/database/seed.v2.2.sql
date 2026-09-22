-- =====================================================================
-- Shahebbazar -- seed v2.2: profile detail for the business profile page
-- =====================================================================
--
-- Website addresses and profile attributes for the featured businesses.
--
-- All values are fictional sample data.
--
-- Run after schema.v2.2.sql and seed.v2.1.sql.
-- =====================================================================

BEGIN;

UPDATE vendors v SET vendor_website = w.url
FROM (VALUES
    ('rajshahi-medical-centre', 'www.rajshahimedical.example'),
    ('padma-view-restaurant',   'www.padmaview.example'),
    ('grand-river-view-hotel',  'www.grandriverview.example'),
    ('rajshahi-craft-outlet',   'www.rajshahicraft.example'),
    ('digitax-accounting',      'www.digitax.example'),
    ('shaheb-bazar-silk-house', 'www.shahebbazarsilk.example')
) AS w(slug, url)
WHERE v.vendor_slug = w.slug;

-- ---------------------------------------------------------------------
-- Attributes rendered beside the business description
-- ---------------------------------------------------------------------
INSERT INTO vendor_facts (vendor_id, fact_group, fact_label, fact_value, fact_icon, fact_sort_order)
SELECT v.vendor_id, 'about', f.label, f.value, f.icon, f.sort
FROM (VALUES
    ('rajshahi-medical-centre', 'Established',   '2008',                'calendar',   0),
    ('rajshahi-medical-centre', 'License No.',   'DGHS-3421',           'badge',      1),
    ('rajshahi-medical-centre', 'Hospital Type', 'Multi-specialty',     'building',   2),
    ('rajshahi-medical-centre', 'Emergency',     '24/7 Available',      'siren',      3),

    ('padma-view-restaurant',   'Established',   '2016',                'calendar',   0),
    ('padma-view-restaurant',   'Cuisine',       'Bangladeshi, Continental', 'utensils', 1),
    ('padma-view-restaurant',   'Seating',       '80 covers',           'users',      2),
    ('padma-view-restaurant',   'Parking',       'On site',             'car',        3),

    ('grand-river-view-hotel',  'Established',   '2012',                'calendar',   0),
    ('grand-river-view-hotel',  'License No.',   'BTB-RJ-882',          'badge',      1),
    ('grand-river-view-hotel',  'Check-in',      '2:00 PM',             'clock',      2),
    ('grand-river-view-hotel',  'Check-out',     '12:00 PM',            'clock',      3),

    ('rajshahi-craft-outlet',   'Established',   '2019',                'calendar',   0),
    ('rajshahi-craft-outlet',   'Artisan Groups','14 across Rajshahi',  'users',      1),

    ('digitax-accounting',      'Established',   '2021',                'calendar',   0),
    ('digitax-accounting',      'Registration',  'ICAB-4417',           'badge',      1),

    ('shaheb-bazar-silk-house', 'Established',   '1994',                'calendar',   0),
    ('shaheb-bazar-silk-house', 'Looms',         '22 hand and power',   'factory',    1)
) AS f(slug, label, value, icon, sort)
JOIN vendors v ON v.vendor_slug = f.slug
ON CONFLICT (vendor_id, fact_group, fact_label) DO NOTHING;

-- ---------------------------------------------------------------------
-- Attributes rendered in the sidebar summary grid
-- ---------------------------------------------------------------------
INSERT INTO vendor_facts (vendor_id, fact_group, fact_label, fact_value, fact_icon, fact_sort_order)
SELECT v.vendor_id, 'quick', f.label, f.value, f.icon, f.sort
FROM (VALUES
    ('rajshahi-medical-centre', 'Beds',           '120+', 'bed',        0),
    ('rajshahi-medical-centre', 'Doctors',        '45+',  'stethoscope',1),
    ('rajshahi-medical-centre', 'Nurses',         '80+',  'users',      2),
    ('rajshahi-medical-centre', 'Daily Visitors', '300+', 'activity',   3),

    ('grand-river-view-hotel',  'Rooms',          '64',   'bed',        0),
    ('grand-river-view-hotel',  'Suites',         '8',    'building',   1),
    ('grand-river-view-hotel',  'Restaurants',    '2',    'utensils',   2),
    ('grand-river-view-hotel',  'Parking',        '30',   'car',        3),

    ('padma-view-restaurant',   'Covers',         '80',   'users',      0),
    ('padma-view-restaurant',   'Private Rooms',  '3',    'building',   1),

    ('shaheb-bazar-silk-house', 'Looms',          '22',   'factory',    0),
    ('shaheb-bazar-silk-house', 'Weavers',        '35',   'users',      1)
) AS f(slug, label, value, icon, sort)
JOIN vendors v ON v.vendor_slug = f.slug
ON CONFLICT (vendor_id, fact_group, fact_label) DO NOTHING;

-- ---------------------------------------------------------------------
-- Listings for the consumer businesses, populating the services section
-- of the profile page.
--
-- Services without a fixed price leave listing_price NULL, which the
-- column permits.
-- ---------------------------------------------------------------------
INSERT INTO vendor_listings (
    vendor_id, category_id, listing_title, listing_title_bn, listing_slug,
    listing_description, listing_price, listing_price_unit, listing_status
)
SELECT v.vendor_id, c.category_id, x.title, x.title_bn, x.slug,
       x.descr, x.price, x.unit, 'approved'
FROM (VALUES
    -- Hospital departments
    ('rajshahi-medical-centre', 'hospitals', 'General Medicine', 'জেনারেল মেডিসিন', 'general-medicine', 'Indoor and outdoor consultation across general conditions.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Cardiology', 'কার্ডিওলজি', 'cardiology', 'Heart care, ECG and echocardiography.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Orthopedics', 'অর্থোপেডিক্স', 'orthopedics', 'Bone and joint treatment, fracture management.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Pediatrics', 'শিশু বিভাগ', 'pediatrics', 'Child health, vaccination and growth monitoring.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Gynecology', 'গাইনি', 'gynecology', 'Women''s health, antenatal and postnatal care.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Radiology', 'রেডিওলজি', 'radiology', 'X-Ray, CT and MRI with consultant reporting.', NULL, NULL),
    ('rajshahi-medical-centre', 'hospitals', 'Pathology', 'প্যাথলজি', 'pathology', 'Laboratory tests with same-day reports.', 400.00, 'test'),
    ('rajshahi-medical-centre', 'hospitals', 'Emergency', 'জরুরি বিভাগ', 'emergency', '24/7 emergency admission and ambulance.', NULL, NULL),

    ('padma-view-restaurant', 'food', 'Kacchi Biryani', 'কাচ্চি বিরিয়ানি', 'kacchi-biryani', 'Mutton kacchi cooked to order, served with borhani.', 420.00, 'plate'),
    ('padma-view-restaurant', 'food', 'Padma River Fish Curry', 'পদ্মার মাছের ঝোল', 'padma-fish-curry', 'Seasonal river fish in a light mustard curry.', 380.00, 'plate'),
    ('padma-view-restaurant', 'food', 'Family Platter', 'ফ্যামিলি প্লেটার', 'family-platter', 'Rice, three curries, salad and dessert for four.', 1450.00, 'platter'),
    ('padma-view-restaurant', 'food', 'Riverside Terrace Booking', 'টেরেস বুকিং', 'terrace-booking', 'Reserved terrace table at sunset, minimum four guests.', 500.00, 'booking'),

    ('grand-river-view-hotel', 'hotels', 'Deluxe Room', 'ডিলাক্স রুম', 'deluxe-room', 'Air-conditioned double with river-facing window.', 4500.00, 'night'),
    ('grand-river-view-hotel', 'hotels', 'Executive Suite', 'এক্সিকিউটিভ স্যুট', 'executive-suite', 'Separate living area, work desk and breakfast included.', 8500.00, 'night'),
    ('grand-river-view-hotel', 'hotels', 'Conference Hall', 'কনফারেন্স হল', 'conference-hall', 'Seats 60, projector and catering available.', 12000.00, 'day'),
    ('grand-river-view-hotel', 'hotels', 'Airport Pickup', 'বিমানবন্দর পিকআপ', 'airport-pickup', 'Car and driver from Shah Makhdum Airport.', 1200.00, 'trip'),

    ('rajshahi-craft-outlet', 'stores', 'Handloom Cotton Kurta', 'হ্যান্ডলুম কুর্তা', 'handloom-kurta', 'Woven and stitched by artisan groups in Rajshahi district.', 1250.00, 'piece'),
    ('rajshahi-craft-outlet', 'stores', 'Leather Satchel', 'চামড়ার ব্যাগ', 'leather-satchel', 'Vegetable-tanned leather with brass fittings.', 3400.00, 'piece'),
    ('rajshahi-craft-outlet', 'stores', 'Nakshi Kantha Throw', 'নকশি কাঁথা', 'nakshi-kantha-throw', 'Hand-embroidered quilt, single bed size.', 2800.00, 'piece'),

    ('digitax-accounting', 'services', 'VAT Registration', 'ভ্যাট নিবন্ধন', 'vat-registration', 'BIN registration handled end to end, including filing.', 6000.00, 'service'),
    ('digitax-accounting', 'services', 'Monthly Bookkeeping', 'মাসিক হিসাবরক্ষণ', 'monthly-bookkeeping', 'Ledgers, reconciliation and a monthly summary.', 4500.00, 'month'),
    ('digitax-accounting', 'services', 'Annual Return Filing', 'বার্ষিক রিটার্ন', 'annual-return', 'Company and personal income tax return preparation.', 9000.00, 'return')
) AS x(vendor_slug, category_slug, title, title_bn, slug, descr, price, unit)
JOIN vendors    v ON v.vendor_slug   = x.vendor_slug
JOIN categories c ON c.category_slug = x.category_slug
ON CONFLICT (vendor_id, listing_slug) DO NOTHING;

-- Associates sample photographs with the new listings so the profile
-- gallery is populated.
INSERT INTO listing_photos (listing_id, photo_url, photo_alt_text, photo_sort_order, photo_is_primary)
SELECT l.listing_id, p.url, p.alt, 0, TRUE
FROM (VALUES
    ('general-medicine',   'uploads/1788451854562-688168547.jpg', 'General medicine consultation room'),
    ('radiology',          'uploads/1788453621026-466847301.jpg', 'Radiology suite'),
    ('kacchi-biryani',     'uploads/1788454922883-1396819.jpg',   'Plate of kacchi biryani'),
    ('deluxe-room',        'uploads/1788455110818-348770521.jpg', 'Deluxe room with river view'),
    ('handloom-kurta',     'uploads/1788456632248-187962939.jpg', 'Handloom cotton kurta')
) AS p(listing_slug, url, alt)
JOIN vendor_listings l ON l.listing_slug = p.listing_slug
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Written review bodies.
--
-- seed.v2.1 generates ratings without text so the averages are derived
-- from real rows. This adds review text to the most recent review of each
-- featured business for display on the profile page.
-- ---------------------------------------------------------------------
UPDATE reviews r SET review_body = t.body
FROM (VALUES
    ('rajshahi-medical-centre',
     'Excellent service. The doctors are very professional and the environment is clean and well maintained.'),
    ('padma-view-restaurant',
     'Went for dinner with family. The river view at sunset is the reason to come, and the kacchi was genuinely good.'),
    ('grand-river-view-hotel',
     'Clean rooms and helpful staff. Breakfast was limited but the location near the embankment made up for it.'),
    ('rajshahi-craft-outlet',
     'Bought jute bags and a cane basket. Honest pricing and they explained which artisan group made each piece.'),
    ('digitax-accounting',
     'Handled our VAT registration end to end and explained each step clearly.'),
    ('shaheb-bazar-silk-house',
     'Genuine Rajshahi silk. The owner explained the difference between katan and tangail properly. Delivered in a week.')
) AS t(slug, body)
WHERE r.review_id = (
    SELECT r2.review_id
    FROM reviews r2
    JOIN vendors v2 ON v2.vendor_id = r2.vendor_id
    WHERE v2.vendor_slug = t.slug
      AND r2.review_status = 'published'
      AND r2.review_rating >= 4
    ORDER BY r2.review_id DESC
    LIMIT 1
);

COMMIT;
