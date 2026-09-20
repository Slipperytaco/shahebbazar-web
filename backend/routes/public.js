const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * Public read endpoints.
 *
 * Consumed by the Next.js frontend during server-side rendering. All
 * responses are restricted to approved records, either by an explicit
 * status filter or by reading v_business_cards, which applies the filter.
 */

// Home page result limits.
const HOME_FEATURED_LIMIT = 5;
const HOME_CATEGORY_LIMIT = 6;
const HOME_EVENT_LIMIT = 3;
const HOME_SEARCH_CHIP_LIMIT = 8;

/**
 * Top-level categories with a derived subtitle.
 *
 * The subtitle is composed from the first three child categories rather
 * than stored, so taxonomy changes cannot leave a stale caption.
 */
const CATEGORY_TILE_SQL = `
    SELECT p.category_id,
           p.category_name,
           p.category_name_bn,
           p.category_slug,
           p.category_icon,
           (
               SELECT string_agg(ch.category_name, ', ' ORDER BY ch.sort_order, ch.category_id)
               FROM (
                   SELECT category_name, category_sort_order AS sort_order, category_id
                   FROM categories
                   WHERE category_parent_id = p.category_id AND category_is_active
                   ORDER BY category_sort_order, category_id
                   LIMIT 3
               ) ch
           ) AS subtitle,
           -- Bangla equivalent. COALESCE falls back to the English name so
           -- a child without a translation is not dropped from the list.
           (
               SELECT string_agg(COALESCE(ch.category_name_bn, ch.category_name), ', '
                                 ORDER BY ch.sort_order, ch.category_id)
               FROM (
                   SELECT category_name, category_name_bn,
                          category_sort_order AS sort_order, category_id
                   FROM categories
                   WHERE category_parent_id = p.category_id AND category_is_active
                   ORDER BY category_sort_order, category_id
                   LIMIT 3
               ) ch
           ) AS subtitle_bn,
           (
               SELECT COUNT(DISTINCT vc.vendor_id)
               FROM vendor_categories vc
               JOIN categories c2 ON c2.category_id = vc.category_id
               JOIN vendors v2 ON v2.vendor_id = vc.vendor_id AND v2.vendor_status = 'approved'
               WHERE c2.category_id = p.category_id OR c2.category_parent_id = p.category_id
           ) AS business_count
    FROM categories p
    WHERE p.category_parent_id IS NULL AND p.category_is_active
    ORDER BY p.category_sort_order, p.category_id
    LIMIT $1
`;

/**
 * Business card projection. v_business_cards restricts to approved vendors
 * and derives rating, review count and today's open state.
 */
const BUSINESS_CARD_SQL = `
    SELECT vendor_id, vendor_slug, vendor_name, vendor_name_bn,
           vendor_description, vendor_address, vendor_cover_url, vendor_logo_url,
           vendor_is_featured, is_verified,
           area_name, area_name_bn,
           primary_category, primary_category_bn, primary_category_slug,
           rating, review_count,
           open_state, close_time_today
    FROM v_business_cards
`;

router.get("/home", async (req, res) => {
    try {
        // Issued concurrently. Any failure fails the whole response: a
        // home page missing a section should not be served as valid.
        const [categories, featured, events, searches] = await Promise.all([
            pool.query(CATEGORY_TILE_SQL, [HOME_CATEGORY_LIMIT]),

            pool.query(
                `${BUSINESS_CARD_SQL}
                 WHERE vendor_is_featured
                 ORDER BY rating DESC, review_count DESC
                 LIMIT $1`,
                [HOME_FEATURED_LIMIT]
            ),

            pool.query(
                `SELECT event_id, event_title, event_title_bn, event_slug,
                        event_venue, event_starts_at, event_ends_at
                 FROM events
                 WHERE event_status = 'published' AND event_starts_at > NOW()
                 ORDER BY event_starts_at
                 LIMIT $1`,
                [HOME_EVENT_LIMIT]
            ),

            // Reads the aggregated view rather than search_logs directly.
            // The view suppresses low-frequency terms, preventing a single
            // user's query from surfacing as a popular search.
            pool.query(
                `SELECT search_query_normalised AS term, SUM(trend_count) AS hits
                 FROM v_search_trends_daily
                 GROUP BY 1
                 ORDER BY hits DESC, term
                 LIMIT $1`,
                [HOME_SEARCH_CHIP_LIMIT]
            ),
        ]);

        res.json({
            categories: categories.rows,
            featured: featured.rows,
            events: events.rows,
            popularSearches: searches.rows.map((r) => r.term),
        });
    } catch (err) {
        console.error("GET /api/home failed:", err);
        res.status(500).json(errorBody("Could not load home page data", err));
    }
});

/**
 * Builds an error response body.
 *
 * Outside production the underlying database message is included to aid
 * diagnosis. It is withheld in production because database errors expose
 * table and column names.
 *
 * @param {string} message  Client-facing summary.
 * @param {Error} err       Originating error.
 */
function errorBody(message, err) {
    if (process.env.NODE_ENV === "production") return { error: message };

    return {
        error: message,
        detail: err.message,
        hint:
            err.code === "42P01"
                ? "A table or view is missing. Run `npm run db:load` from the repo root."
                : undefined,
    };
}

router.get("/categories", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.category_id, c.category_parent_id, c.category_name,
                    c.category_name_bn, c.category_slug, c.category_icon,
                    -- Counts children too, so a parent is never shown as
                    -- empty while its subcategories hold businesses.
                    (
                        SELECT COUNT(DISTINCT vc.vendor_id)
                        FROM vendor_categories vc
                        JOIN categories c2 ON c2.category_id = vc.category_id
                        JOIN vendors v2 ON v2.vendor_id = vc.vendor_id
                                       AND v2.vendor_status = 'approved'
                        WHERE c2.category_id = c.category_id
                           OR c2.category_parent_id = c.category_id
                    ) AS business_count
             FROM categories c
             WHERE c.category_is_active
             ORDER BY c.category_sort_order, c.category_name`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("GET /api/categories failed:", err);
        res.status(500).json(errorBody("Could not load categories", err));
    }
});

/**
 * Business search and listing.
 *
 * Promoted records are returned in a separate `sponsored` array rather
 * than merged into `results`, so the client cannot render paid placement
 * as an organic result. Paid placement must be displayed with a label.
 *
 * Query parameters: q, category, area, sort, limit, offset.
 */
router.get("/businesses", async (req, res) => {
    const { q, category, area } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];

    if (q) {
        params.push(`%${q}%`);
        // Matches business name and the titles of its approved listings,
        // supporting search by product or service as well as by name.
        //
        // Columns are table-qualified because the facet queries reuse this
        // clause with `vendors` joined, where an unqualified column name
        // would be ambiguous. The qualifier is rewritten to the alias.
        where.push(`(
            v_business_cards.vendor_name ILIKE $${params.length}
            OR v_business_cards.vendor_name_bn ILIKE $${params.length}
            OR v_business_cards.vendor_description ILIKE $${params.length}
            OR EXISTS (
                SELECT 1 FROM vendor_listings l
                WHERE l.vendor_id = v_business_cards.vendor_id
                  AND l.listing_status = 'approved'
                  AND (l.listing_title ILIKE $${params.length}
                       OR l.listing_title_bn ILIKE $${params.length})
            )
        )`);
    }

    if (category) {
        params.push(category);
        where.push(`EXISTS (
            SELECT 1 FROM vendor_categories vc
            JOIN categories c ON c.category_id = vc.category_id
            LEFT JOIN categories parent ON parent.category_id = c.category_parent_id
            WHERE vc.vendor_id = v_business_cards.vendor_id
              AND (c.category_slug = $${params.length} OR parent.category_slug = $${params.length})
        )`);
    }

    if (area) {
        params.push(area);
        where.push(`EXISTS (
            SELECT 1 FROM vendors v2
            JOIN locations l2 ON l2.location_id = v2.location_id
            WHERE v2.vendor_id = v_business_cards.vendor_id AND l2.location_slug = $${params.length}
        )`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const andSql = where.length ? `AND ${where.join(" AND ")}` : "";

    // ORDER BY cannot be parameterised, so the sort key is resolved
    // against a fixed whitelist rather than interpolated from input.
    const SORTS = {
        relevance: "vendor_is_featured DESC, rating DESC, review_count DESC, vendor_name",
        rating: "rating DESC, review_count DESC, vendor_name",
        reviews: "review_count DESC, rating DESC, vendor_name",
        name: "vendor_name",
    };
    const sort = SORTS[req.query.sort] ? req.query.sort : "relevance";

    try {
        const [organic, sponsored, total, areas, categories] = await Promise.all([
            // Promoted records are excluded here and returned separately,
            // preventing a vendor appearing twice on the same page.
            pool.query(
                `${BUSINESS_CARD_SQL}
                 WHERE NOT vendor_is_featured ${andSql}
                 ORDER BY ${SORTS[sort]}
                 LIMIT ${limit} OFFSET ${offset}`,
                params
            ),

            // Paid placement: first page only, limited to two records.
            offset === 0
                ? pool.query(
                      `${BUSINESS_CARD_SQL}
                       WHERE vendor_is_featured ${andSql}
                       ORDER BY rating DESC
                       LIMIT 2`,
                      params
                  )
                : Promise.resolve({ rows: [] }),

            // Counts all matches including promoted records, since both
            // are displayed and both count towards the reported total.
            pool.query(
                `SELECT COUNT(*)::int AS n FROM v_business_cards ${whereSql}`,
                params
            ),

            // Facet counts for the sidebar, evaluated against the active
            // filter so the counts narrow as filters are applied.
            pool.query(
                `SELECT l.location_name AS name, l.location_name_bn AS name_bn,
                        l.location_slug AS slug, COUNT(*)::int AS count
                 FROM v_business_cards b
                 JOIN vendors v ON v.vendor_id = b.vendor_id
                 JOIN locations l ON l.location_id = v.location_id
                 ${whereSql ? whereSql.replace(/v_business_cards/g, "b") : ""}
                 GROUP BY 1, 2, 3
                 ORDER BY count DESC, name
                 LIMIT 6`,
                params
            ),

            pool.query(
                `SELECT c.category_name AS name, c.category_name_bn AS name_bn,
                        c.category_slug AS slug, COUNT(DISTINCT b.vendor_id)::int AS count
                 FROM v_business_cards b
                 JOIN vendor_categories vc ON vc.vendor_id = b.vendor_id
                 JOIN categories c ON c.category_id = vc.category_id
                 ${whereSql ? whereSql.replace(/v_business_cards/g, "b") : ""}
                 GROUP BY 1, 2, 3
                 ORDER BY count DESC, name
                 LIMIT 6`,
                params
            ),
        ]);

        res.json({
            results: organic.rows,
            sponsored: sponsored.rows,
            total: total.rows[0].n,
            limit,
            offset,
            sort,
            facets: { areas: areas.rows, categories: categories.rows },
        });
    } catch (err) {
        console.error("GET /api/businesses failed:", err);
        res.status(500).json(errorBody("Could not load businesses", err));
    }
});

/**
 * Full business profile, addressed by slug.
 *
 * Returns the record together with its categories, opening hours, photos,
 * listings, facts, reviews, rating distribution and nearby businesses in
 * the same category.
 *
 * Addressed by slug rather than id to produce descriptive, indexable URLs.
 */
router.get("/businesses/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
        // Joins `vendors` for coordinates, which the card view omits and
        // the distance calculation requires.
        const businessResult = await pool.query(
            `SELECT b.*, v.vendor_lat, v.vendor_lng
             FROM v_business_cards b
             JOIN vendors v ON v.vendor_id = b.vendor_id
             WHERE b.vendor_slug = $1`,
            [slug]
        );

        // v_business_cards contains approved vendors only, so unapproved
        // records return 404 rather than being disclosed.
        if (businessResult.rowCount === 0) {
            return res.status(404).json({ error: "Business not found" });
        }

        const business = businessResult.rows[0];
        const id = business.vendor_id;

        const [extra, categories, hours, photos, listings, facts, reviews, distribution, similar] =
            await Promise.all([
                pool.query(
                    `SELECT vendor_address, vendor_phone, vendor_whatsapp, vendor_email,
                            vendor_website, vendor_lat, vendor_lng, vendor_created_at
                     FROM vendors WHERE vendor_id = $1`,
                    [id]
                ),

                pool.query(
                    `SELECT c.category_name AS name, c.category_name_bn AS name_bn,
                            c.category_slug AS slug
                     FROM vendor_categories vc
                     JOIN categories c ON c.category_id = vc.category_id
                     WHERE vc.vendor_id = $1
                     ORDER BY c.category_sort_order, c.category_id`,
                    [id]
                ),

                pool.query(
                    `SELECT hours_day_of_week AS day, hours_open_time AS open_time,
                            hours_close_time AS close_time, hours_is_closed AS is_closed,
                            hours_is_24h AS is_24h
                     FROM vendor_opening_hours
                     WHERE vendor_id = $1
                     ORDER BY hours_day_of_week`,
                    [id]
                ),

                // The gallery is composed of photographs attached to the
                // business's approved listings.
                pool.query(
                    `SELECT p.photo_url AS url, p.photo_alt_text AS alt
                     FROM listing_photos p
                     JOIN vendor_listings l ON l.listing_id = p.listing_id
                     WHERE l.vendor_id = $1 AND l.listing_status = 'approved'
                     ORDER BY p.photo_is_primary DESC, p.photo_sort_order, p.photo_id`,
                    [id]
                ),

                pool.query(
                    `SELECT listing_id, listing_title AS title, listing_title_bn AS title_bn,
                            listing_slug AS slug, listing_description AS description,
                            listing_price AS price, listing_price_max AS price_max,
                            listing_price_unit AS unit, listing_min_order_qty AS min_order_qty
                     FROM vendor_listings
                     WHERE vendor_id = $1 AND listing_status = 'approved'
                     ORDER BY listing_id`,
                    [id]
                ),

                pool.query(
                    `SELECT fact_group AS "group", fact_label AS label,
                            fact_value AS value, fact_icon AS icon
                     FROM vendor_facts
                     WHERE vendor_id = $1
                     ORDER BY fact_group, fact_sort_order, fact_id`,
                    [id]
                ),

                // Reviews with written content only; ratings without a body
                // contribute to the average but have nothing to display.
                pool.query(
                    `SELECT r.review_id, r.review_rating AS rating, r.review_body AS body,
                            r.review_created_at AS created_at, u.user_name AS author,
                            u.user_phone_verified_at IS NOT NULL AS author_verified
                     FROM reviews r
                     JOIN users u ON u.user_id = r.user_id
                     WHERE r.vendor_id = $1 AND r.review_status = 'published'
                       AND r.review_body IS NOT NULL
                     ORDER BY r.review_created_at DESC
                     LIMIT 5`,
                    [id]
                ),

                pool.query(
                    `SELECT review_rating AS rating, COUNT(*)::int AS count
                     FROM reviews
                     WHERE vendor_id = $1 AND review_status = 'published'
                     GROUP BY 1`,
                    [id]
                ),

                // Nearby businesses sharing a category. Distance uses an
                // equirectangular approximation, which is sufficient at
                // city scale and avoids a PostGIS dependency.
                pool.query(
                    `SELECT b.*,
                            ROUND((111.045 * SQRT(
                                POW(v.vendor_lat - $2, 2) +
                                POW((v.vendor_lng - $3) * COS(RADIANS($2)), 2)
                            ))::numeric, 1) AS distance_km
                     FROM v_business_cards b
                     JOIN vendors v ON v.vendor_id = b.vendor_id
                     WHERE b.vendor_id <> $1
                       AND EXISTS (
                           SELECT 1 FROM vendor_categories a
                           JOIN vendor_categories c ON c.category_id = a.category_id
                           WHERE a.vendor_id = $1 AND c.vendor_id = b.vendor_id
                       )
                     ORDER BY distance_km NULLS LAST, b.rating DESC
                     LIMIT 4`,
                    [id, business.vendor_lat ?? 0, business.vendor_lng ?? 0]
                ),
            ]);

        const byRating = Object.fromEntries(distribution.rows.map((r) => [r.rating, r.count]));

        res.json({
            business: { ...business, ...extra.rows[0] },
            categories: categories.rows,
            hours: hours.rows,
            photos: photos.rows,
            listings: listings.rows,
            facts: facts.rows,
            reviews: reviews.rows,
            ratingDistribution: [5, 4, 3, 2, 1].map((rating) => ({
                rating,
                count: byRating[rating] ?? 0,
            })),
            similar: similar.rows,
        });
    } catch (err) {
        console.error(`GET /api/businesses/${slug} failed:`, err);
        res.status(500).json(errorBody("Could not load business", err));
    }
});

module.exports = router;
