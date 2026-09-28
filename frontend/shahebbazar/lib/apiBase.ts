// Client components call the API from the browser, so they need a NEXT_PUBLIC_ variable.
export const BROWSER_API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
