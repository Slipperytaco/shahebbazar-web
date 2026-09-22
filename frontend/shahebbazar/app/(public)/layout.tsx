import type { Metadata } from "next";

/**
 * Public area.
 *
 * A route group: the parentheses organise files without contributing a
 * URL segment, so `app/(public)/page.tsx` serves `/` and a profile is
 * served at `/business/<slug>` rather than under a group prefix.
 *
 * Every route below this layout is readable without authentication and
 * must not assume a signed-in user.
 *
 * The authenticated customer routes are in `(seeker)`, which applies an
 * access gate that this area must never have.
 */

export const metadata: Metadata = {
    robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    // Page chrome is applied per page via <AppShell> rather than here,
    // because it requires the locale, which is read from a search
    // parameter that Next.js does not pass to layouts.
    return children;
}
