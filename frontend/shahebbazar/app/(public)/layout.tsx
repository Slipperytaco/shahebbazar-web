import type { Metadata } from "next";

/**
 * PUBLIC AREA — the customer / seeker side.
 *
 * `(public)` is a route group: the parentheses mean the folder organises
 * files WITHOUT adding a URL segment. So this file sits at
 * `app/(public)/page.tsx` and still serves `/`, and a shop profile will be
 * `/business/rajshahi-medical-centre`, not `/public/business/...`.
 *
 * That matters: the client requires shop pages to be crawlable, and a
 * meaningless `/customer` or `/public` prefix would make every indexed URL
 * longer and worse for no benefit.
 *
 * Everything under here is readable signed out. Nothing in this folder may
 * assume a logged-in user.
 *
 * This is the seeker's browsing half. The signed-in half of the same
 * person — saved shops, their quote requests, messages — lives in
 * `(seeker)`, because it needs a gate and this must never have one.
 *
 * Owned by: the customer-side work.
 */

export const metadata: Metadata = {
    robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    // The page chrome (header, side nav, footer) is applied per page via
    // <AppShell>, not here, because it needs the locale and `?lang=` is a
    // search param — which Next does not pass to layouts. Once the locale
    // moves into the route as `/en` and `/bn`, the shell moves up here and
    // the pages get shorter.
    return children;
}
