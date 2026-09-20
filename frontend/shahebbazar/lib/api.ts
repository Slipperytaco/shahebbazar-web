import type {
    CategoryNode,
    HomePayload,
    BusinessSearchPayload,
    BusinessDetail,
    PaymentMethod,
    VendorPaymentMethods,
} from "./types";

/**
 * Server-side data access layer.
 *
 * All functions execute on the server during rendering, never in the
 * browser, so rendered markup is complete for search engine crawlers.
 *
 * The API base URL is supplied by environment variable so the deployed
 * host can differ from the development host.
 */
const API_BASE = process.env.API_BASE_URL || "http://localhost:4000";

/**
 * Resolves a stored relative asset path to an absolute URL.
 *
 * @param storedPath Path as held in the database, or null.
 * @returns Absolute URL, or null when no path is stored.
 */
export function assetUrl(storedPath: string | null): string | null {
    if (!storedPath) return null;
    if (/^https?:\/\//i.test(storedPath)) return storedPath;
    const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL || API_BASE;
    return `${base}/${storedPath.replace(/^\/+/, "").replace(/\\/g, "/")}`;
}

class ApiError extends Error {
    constructor(readonly status: number, readonly path: string) {
        super(`API ${path} responded ${status}`);
    }
}

async function getJson<T>(path: string, revalidateSeconds: number): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        // Directory content changes infrequently, so a short revalidation
        // window reduces database load under concurrent traffic.
        next: { revalidate: revalidateSeconds },
        headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new ApiError(res.status, path);
    return res.json() as Promise<T>;
}

/**
 * Retrieves home page content.
 *
 * Returns empty collections instead of throwing when the API is
 * unavailable, so the page renders its navigation, search and footer
 * rather than failing entirely.
 */
export async function getHomeData(): Promise<HomePayload> {
    try {
        return await getJson<HomePayload>("/api/home", 300);
    } catch (err) {
        console.error("getHomeData failed, rendering empty shell:", err);
        return { categories: [], featured: [], events: [], popularSearches: [] };
    }
}

/** Empty list rather than a throw, so the page renders its shell. */
export async function getCategories(): Promise<CategoryNode[]> {
    try {
        return await getJson<CategoryNode[]>("/api/categories", 300);
    } catch (err) {
        console.error("getCategories failed, rendering empty shell:", err);
        return [];
    }
}

export async function searchBusinesses(params: {
    q?: string;
    category?: string;
    area?: string;
    sort?: string;
    limit?: number;
    offset?: number;
}): Promise<BusinessSearchPayload> {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") qs.set(key, String(value));
    }

    try {
        return await getJson<BusinessSearchPayload>(`/api/businesses?${qs}`, 60);
    } catch (err) {
        console.error("searchBusinesses failed:", err);
        return {
            results: [],
            sponsored: [],
            total: 0,
            limit: 20,
            offset: 0,
            sort: "relevance",
            facets: { areas: [], categories: [] },
        };
    }
}

/**
 * Retrieves a single business profile.
 *
 * @param slug Business slug.
 * @returns The profile, or null when the business does not exist.
 * @throws On any non-404 API failure, so an incomplete profile is never
 *         rendered as though it were complete.
 */
export async function getBusiness(slug: string): Promise<BusinessDetail | null> {
    const path = `/api/businesses/${encodeURIComponent(slug)}`;

    const res = await fetch(`${API_BASE}${path}`, {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);

    return res.json() as Promise<BusinessDetail>;
}

// Returns null on failure so the profile still renders without the panel.
export async function getPaymentMethods(slug: string): Promise<PaymentMethod[] | null> {
    try {
        return await getJson<PaymentMethod[]>(
            `/api/businesses/${encodeURIComponent(slug)}/payment-methods`,
            300
        );
    } catch (err) {
        console.error(`getPaymentMethods(${slug}) failed:`, err);
        return null;
    }
}

export async function getVendorPaymentMethods(
    vendorId: number
): Promise<VendorPaymentMethods | null> {
    const path = `/api/vendors/${vendorId}/payment-methods`;

    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);

    return res.json() as Promise<VendorPaymentMethods>;
}

export type SavePaymentMethodsResult =
    | { ok: true; methods: PaymentMethod[] }
    | { ok: false; error: string };

export async function saveVendorPaymentMethods(
    vendorId: number,
    methods: PaymentMethod[]
): Promise<SavePaymentMethodsResult> {
    const path = `/api/vendors/${vendorId}/payment-methods`;

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: "PUT",
            cache: "no-store",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ methods }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return { ok: false, error: body?.error ?? `Save failed (${res.status})` };
        }

        return { ok: true, methods: body as PaymentMethod[] };
    } catch (err) {
        console.error(`saveVendorPaymentMethods(${vendorId}) failed:`, err);
        return { ok: false, error: "Could not reach the server. Try again." };
    }
}
