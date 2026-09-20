/**
 * API response contract.
 *
 * Shared definitions for every payload returned by the Express API. A
 * column rename that is not reflected here surfaces as a compile error
 * rather than as missing data at runtime.
 *
 * Field names match the database columns so a value can be traced from
 * the interface to its source without an intermediate mapping.
 */

export type OpenState = "open" | "closed" | null;

export interface CategoryTile {
    category_id: number;
    category_name: string;
    category_name_bn: string | null;
    category_slug: string;
    category_icon: string | null;
    /** Derived from the first three child categories. */
    subtitle: string | null;
    subtitle_bn: string | null;
    business_count: string | number;
}

/** A row of the category taxonomy. */
export interface CategoryNode {
    category_id: number;
    category_parent_id: number | null;
    category_name: string;
    category_name_bn: string | null;
    category_slug: string;
    category_icon: string | null;
    /** Approved businesses here and in child categories. */
    business_count: string | number;
}

export interface BusinessCard {
    vendor_id: number;
    vendor_slug: string;
    vendor_name: string;
    vendor_name_bn: string | null;
    vendor_description: string | null;
    vendor_address: string | null;
    vendor_cover_url: string | null;
    vendor_logo_url: string | null;
    vendor_is_featured: boolean;
    is_verified: boolean;
    area_name: string | null;
    area_name_bn: string | null;
    primary_category: string | null;
    primary_category_bn: string | null;
    primary_category_slug: string | null;
    /** NUMERIC is returned by `pg` as a string; convert before comparison. */
    rating: string | number;
    review_count: string | number;
    open_state: OpenState;
    close_time_today: string | null;
}

export interface EventItem {
    event_id: number;
    event_title: string;
    event_title_bn: string | null;
    event_slug: string;
    event_venue: string | null;
    event_starts_at: string;
    event_ends_at: string | null;
}

export interface HomePayload {
    categories: CategoryTile[];
    featured: BusinessCard[];
    events: EventItem[];
    popularSearches: string[];
}

export interface BusinessSearchPayload {
    results: BusinessCard[];
    /** Paid placement, returned separately so it is always rendered labelled. */
    sponsored: BusinessCard[];
    total: number;
    limit: number;
    offset: number;
    sort: string;
    facets: { areas: Facet[]; categories: Facet[] };
}

/** Facet count used by the search sidebar filters. */
export interface Facet {
    name: string;
    name_bn: string | null;
    slug: string;
    count: number;
}

export interface OpeningHoursRow {
    /** 0 = Sunday to 6 = Saturday, matching PostgreSQL EXTRACT(DOW). */
    day: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
    is_24h: boolean;
}

export interface Photo {
    url: string;
    alt: string | null;
}

export interface Offering {
    listing_id: number;
    title: string;
    title_bn: string | null;
    slug: string;
    description: string | null;
    price: string | number | null;
    price_max: string | number | null;
    unit: string | null;
    min_order_qty: number | null;
}

export interface Fact {
    /** Placement group: 'about' for the description panel, 'quick' for the sidebar. */
    group: "about" | "quick";
    label: string;
    value: string;
    icon: string | null;
}

export interface Review {
    review_id: number;
    rating: number;
    body: string | null;
    created_at: string;
    author: string;
    author_verified: boolean;
}

/** Business card with the distance from the business being viewed. */
export interface SimilarBusiness extends BusinessCard {
    distance_km: string | number | null;
}

// Must match the CHECK constraint in schema.v2.3.sql.
export type PaymentMethodKey =
    | "cash"
    | "cash_on_delivery"
    | "bank_transfer"
    | "bkash"
    | "nagad"
    | "rocket"
    | "card";

export interface PaymentMethod {
    payment_method: PaymentMethodKey;
    payment_note: string | null;
}

export interface VendorPaymentMethods {
    vendor: {
        vendor_id: number;
        vendor_name: string;
        vendor_slug: string;
        vendor_status: string;
    };
    methods: PaymentMethod[];
}

export interface BusinessDetail {
    business: BusinessCard & {
        vendor_phone: string;
        vendor_whatsapp: string | null;
        vendor_email: string | null;
        vendor_website: string | null;
        vendor_lat: string | null;
        vendor_lng: string | null;
        vendor_created_at: string;
    };
    categories: { name: string; name_bn: string | null; slug: string }[];
    hours: OpeningHoursRow[];
    photos: Photo[];
    listings: Offering[];
    facts: Fact[];
    reviews: Review[];
    ratingDistribution: { rating: number; count: number }[];
    similar: SimilarBusiness[];
}
