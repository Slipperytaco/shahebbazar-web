-- Schema v2.4: search appearance counts for the dashboard, and active users across searches and views.

BEGIN;

-- How often each business appeared on the first results page of a typed search, per business per day.
CREATE TABLE vendor_search_impressions (
    vendor_id        INT  NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    impression_day   DATE NOT NULL,
    impression_count INT  NOT NULL DEFAULT 0 CHECK (impression_count >= 0),
    PRIMARY KEY (vendor_id, impression_day)
);

-- Replaces the v2 view so visitors who only searched are counted as active too.
CREATE OR REPLACE VIEW v_active_users_daily AS
SELECT active_day,
       COUNT(DISTINCT session_hash) AS active_sessions
FROM (
    SELECT date_trunc('day', view_created_at)::date AS active_day,
           view_session_hash                        AS session_hash
    FROM   vendor_profile_views
    UNION ALL
    SELECT date_trunc('day', search_created_at)::date,
           search_session_hash
    FROM   search_logs
) activity
GROUP BY 1;

COMMIT;
