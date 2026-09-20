// Client components call the API from the browser, so they need a NEXT_PUBLIC_
// variable. Server components use lib/api.ts — fetching in the browser is what
// hides a page from crawlers.
export const BROWSER_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
