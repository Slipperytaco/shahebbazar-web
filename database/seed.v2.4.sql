-- Seed v2.4: sixty days of profile views and search appearances, so the dashboard chart has history.

BEGIN;

-- Between 4 and 15 views a day, rising gently towards the present.
INSERT INTO vendor_profile_views (vendor_id, view_source, view_session_hash, view_created_at)
SELECT v.vendor_id,
       (ARRAY['search','category','direct','share'])[1 + abs(hashtext(v.vendor_slug || ':src:' || d || ':' || k)) % 4],
       encode(sha256((v.vendor_slug || ':' || d || ':' || k)::bytea), 'hex'),
       (CURRENT_DATE - d) + make_interval(mins => 480 + abs(hashtext(v.vendor_slug || ':t:' || d || ':' || k)) % 720)
FROM vendors v
CROSS JOIN generate_series(1, 60) AS d
CROSS JOIN LATERAL generate_series(1, 4 + abs(hashtext(v.vendor_slug || ':n:' || d)) % 8 + (60 - d) / 15) AS k
WHERE v.vendor_status = 'approved';

-- Between 15 and 74 appearances a day, rising the same way.
INSERT INTO vendor_search_impressions (vendor_id, impression_day, impression_count)
SELECT v.vendor_id,
       CURRENT_DATE - d,
       15 + abs(hashtext(v.vendor_slug || ':imp:' || d)) % 40 + (60 - d) / 3
FROM vendors v
CROSS JOIN generate_series(1, 60) AS d
WHERE v.vendor_status = 'approved'
ON CONFLICT (vendor_id, impression_day) DO NOTHING;

COMMIT;
