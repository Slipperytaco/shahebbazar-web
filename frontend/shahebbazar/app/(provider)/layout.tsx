import type { Metadata } from "next";

/**
 * Provider area.
 *
 * A route group, so it contributes no URL segment; paths derive from the
 * folders within it. Grouping keeps every provider route under a single
 * access gate.
 *
 * Covers the provider dashboard, business editing, listings, inquiries,
 * reviews and analytics.
 */

export const metadata: Metadata = {
    // Authenticated routes are excluded from indexing.
    robots: { index: false, follow: false },
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): apply the access gate once sessions are implemented:
    //
    //   const user = await getSessionUser();
    //   if (!user) redirect("/login");
    //   if (user.user_role !== "vendor") redirect("/");
    //
    // Placing the check in the layout protects every route in this group
    // by default. `users.user_role` exists in the schema but is not yet
    // populated.
    //
    // These routes are currently unprotected and must not be deployed in
    // this state.
    return children;
}
