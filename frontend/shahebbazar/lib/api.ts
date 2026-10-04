import type {
    CategoryNode,
    HomePayload,
    BusinessSearchPayload,
    BusinessDetail,
    PaymentMethod,
    VendorPaymentMethods,
    VendorDashboard,
    DashboardPeriod,
    VendorPickerRow,
    VendorSummary,
    VendorProfile,
    VendorProfileInput,
    VendorProfileWithOptions,
    SaveProfileResult,
    AdminQueue,
    AdminDecision,
    AdminDecisionResult,
} from "./types";

// Server-side data access layer.
const API_BASE = process.env.API_BASE_URL || "http://localhost:4000";

// Resolves a stored relative asset path to an absolute URL.
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
        // Directory content changes rarely, so a short revalidation window reduces database load.
        next: { revalidate: revalidateSeconds },
        headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new ApiError(res.status, path);
    return res.json() as Promise<T>;
}

// Retrieves home page content.
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

// Retrieves a single business profile, or null when it does not exist.
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

// Provider dashboard payload.
export async function getVendorDashboard(
    vendorId: number,
    days: DashboardPeriod
): Promise<VendorDashboard | null> {
    const path = `/api/vendors/${vendorId}/dashboard?days=${days}`;

    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);

    return res.json() as Promise<VendorDashboard>;
}

// Name, slug and status of one business, for a provider page's frame.
export async function getVendorSummary(vendorId: number): Promise<VendorSummary | null> {
    const path = `/api/vendors/${vendorId}/summary`;

    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);

    return res.json() as Promise<VendorSummary>;
}

// Businesses for the development picker on the provider pages.
export async function getVendorsForPicker(): Promise<VendorPickerRow[]> {
    try {
        const rows = await getJsonNoStore<VendorPickerRow[]>("/api/vendors");
        return rows
            .map(({ vendor_id, vendor_name, vendor_status }) => ({
                vendor_id,
                vendor_name,
                vendor_status,
            }))
            .sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
    } catch (err) {
        console.error("getVendorsForPicker failed:", err);
        return [];
    }
}

async function getJsonNoStore<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new ApiError(res.status, path);
    return res.json() as Promise<T>;
}

// Everything the Add / Edit Business form edits, with its option lists.
export async function getVendorProfile(vendorId: number): Promise<VendorProfileWithOptions | null> {
    const path = `/api/vendors/${vendorId}/profile`;

    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);

    return res.json() as Promise<VendorProfileWithOptions>;
}

/** Saves the whole form. Field errors come back keyed by field name. */
export async function saveVendorProfile(
    vendorId: number,
    input: VendorProfileInput
): Promise<SaveProfileResult> {
    const path = `/api/vendors/${vendorId}/profile`;

    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: "PUT",
            cache: "no-store",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                ok: false,
                error: body?.error ?? `Save failed (${res.status})`,
                errors: body?.errors,
            };
        }
        return { ok: true, profile: body as VendorProfile };
    } catch (err) {
        console.error(`saveVendorProfile(${vendorId}) failed:`, err);
        return { ok: false, error: "Could not reach the server. Nothing was saved; try again." };
    }
}

/** Pending businesses and listings, and recent decisions. Never cached. */
export async function getAdminQueue(): Promise<AdminQueue> {
    const path = "/api/admin/queue";
    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new ApiError(res.status, path);
    return res.json() as Promise<AdminQueue>;
}

/** Approves or rejects one pending business or listing. */
export async function decideAdmin(
    kind: "vendor" | "listing",
    id: number,
    decision: AdminDecision,
    reason: string
): Promise<AdminDecisionResult> {
    const path = `/api/admin/${kind}s/${id}/decision`;
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: "POST",
            cache: "no-store",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ decision, reason }),
        });
        if (res.ok) return { ok: true };
        const body = await res.json().catch(() => null);
        return { ok: false, error: body?.error ?? `Failed (${res.status})` };
    } catch (err) {
        console.error(`decideAdmin(${kind}, ${id}) failed:`, err);
        return { ok: false, error: "Could not reach the server. Nothing was changed; try again." };
    }
}

// Reads a JSON endpoint without caching; returns null on 404.
export async function apiGet<T>(path: string): Promise<T | null> {
    const res = await fetch(`${API_BASE}/api${path}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new ApiError(res.status, path);
    return res.json() as Promise<T>;
}

export type SendResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

// Sends a write request and returns the API's error message on failure.
export async function apiSend<T = unknown>(
    method: "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown
): Promise<SendResult<T>> {
    try {
        const res = await fetch(`${API_BASE}/api${path}`, {
            method,
            cache: "no-store",
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) return { ok: false, error: data?.error ?? `Request failed (${res.status})` };
        return { ok: true, data: data as T };
    } catch (err) {
        console.error(`${method} ${path} failed:`, err);
        return { ok: false, error: "Could not reach the server. Try again." };
    }
}
