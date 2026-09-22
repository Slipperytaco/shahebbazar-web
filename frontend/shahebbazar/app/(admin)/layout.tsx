import type { Metadata } from "next";

/**
 * Administration area.
 *
 * A route group, so it contributes no URL segment; routes within it are
 * served under `/admin`.
 *
 * Scope, per client requirement 2E:
 *   - approve and verify new business listings
 *   - moderate reported reviews and profiles
 *   - report daily and weekly search trends and active user counts
 *
 * Supporting database objects already exist:
 *   v_moderation_queue      pending vendors, listings and reports
 *   v_search_trends_daily   search trends, low-frequency terms suppressed
 *   v_active_users_daily    distinct sessions per day
 *   reports, audit_logs     moderation actions and the acting user
 *   vendors.vendor_status, vendor_listings.listing_status
 *                           approval state
 */

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): apply the access gate once sessions are implemented:
    //
    //   const user = await getSessionUser();
    //   if (!user) redirect("/login");
    //   if (user.user_role !== "admin") notFound();
    //
    // notFound() is used rather than a redirect so the existence of this
    // area is not disclosed to an unauthorised request.
    return children;
}
