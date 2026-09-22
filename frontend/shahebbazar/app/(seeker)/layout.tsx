import type { Metadata } from "next";

/**
 * Authenticated customer area.
 *
 * Customer routes are split across two groups because they require
 * different access rules:
 *
 *   (public)   Browsing: search, categories and business profiles.
 *              Readable without authentication and indexable.
 *   (seeker)   Account: saved businesses, submitted quote requests,
 *              messages, reviews and settings. Requires the customer role.
 *
 * Separating by access rule keeps the public pages indexable while giving
 * the customer a private area.
 */

export const metadata: Metadata = {
    // Account routes hold personal data and are excluded from indexing.
    robots: { index: false, follow: false },
};

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): apply the access gate once sessions are implemented:
    //
    //   const user = await getSessionUser();
    //   if (!user) redirect("/login?next=/account");
    //   if (user.user_role !== "customer") redirect("/");
    //
    // The `next` parameter returns the user to the originating page after
    // sign-in.
    return children;
}
