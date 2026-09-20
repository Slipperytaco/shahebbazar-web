import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/public/AppShell";
import { BusinessProfile } from "@/components/public/BusinessProfile";
import { BusinessSidebar } from "@/components/public/BusinessSidebar";
import { assetUrl, getBusiness } from "@/lib/api";
import { resolveLocale, t, localeHref } from "@/lib/i18n";
import { toNumber } from "@/lib/format";
import type { BusinessDetail } from "@/lib/types";

/**
 * A shop profile.
 *
 * This is the page the client's SEO requirement is really about: it has a
 * stable slug URL, it is fully server-rendered, and it carries
 * `LocalBusiness` JSON-LD. Everything a crawler needs is in the HTML before
 * any JavaScript runs.
 */

type Params = { slug: string };
type Query = { lang?: string };

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { slug } = await params;
    const detail = await getBusiness(slug);

    if (!detail) return { title: "Business not found" };

    const { business } = detail;
    const area = business.area_name ? `${business.area_name}, Rajshahi` : "Rajshahi";
    const title = `${business.vendor_name} — ${business.primary_category ?? "Business"} in ${area}`;
    const description =
        business.vendor_description?.slice(0, 155) ??
        `${business.vendor_name} in ${area}. Contact details, opening hours and reviews on Shahebbazar.`;

    const cover = assetUrl(business.vendor_cover_url);

    return {
        title,
        description,
        alternates: { canonical: `/business/${business.vendor_slug}` },
        // Per-shop OpenGraph tags — the client's Phase 1 asked for dynamic
        // OG tags and share preview cards, and this is where they matter.
        openGraph: {
            type: "website",
            title,
            description,
            url: `/business/${business.vendor_slug}`,
            images: cover ? [{ url: cover }] : undefined,
        },
    };
}

export default async function BusinessPage({
    params,
    searchParams,
}: {
    params: Promise<Params>;
    searchParams: Promise<Query>;
}) {
    const [{ slug }, { lang }] = await Promise.all([params, searchParams]);
    const locale = resolveLocale(lang);
    const copy = t(locale);

    const detail = await getBusiness(slug);

    // An unknown slug — or a shop that is pending, rejected or suspended,
    // since the API only serves approved ones — is a 404, not an error.
    if (!detail) notFound();

    return (
        <AppShell locale={locale} current="/search">
            <LocalBusinessJsonLd detail={detail} />

            <Link
                href={localeHref("/search", locale)}
                className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-brand-600 hover:underline"
            >
                <ChevronLeft className="size-4" />
                {copy.backToResults}
            </Link>

            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <BusinessProfile locale={locale} detail={detail} />
                <BusinessSidebar locale={locale} detail={detail} />
            </div>
        </AppShell>
    );
}

/**
 * `LocalBusiness` structured data.
 *
 * The client asked for JSON-LD on merchant listings by name. Only fields
 * that are actually populated are emitted — an `aggregateRating` with zero
 * reviews, or an address with empty parts, is invalid structured data and
 * Google will flag it rather than ignore it.
 */
function LocalBusinessJsonLd({ detail }: { detail: BusinessDetail }) {
    const { business, categories, hours, photos } = detail;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const reviewCount = toNumber(business.review_count);
    const rating = toNumber(business.rating);

    const DAYS = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const json: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: business.vendor_name,
        url: `${siteUrl}/business/${business.vendor_slug}`,
        telephone: business.vendor_phone,
    };

    if (business.vendor_description) json.description = business.vendor_description;
    if (business.vendor_website) {
        json.sameAs = [`https://${business.vendor_website.replace(/^https?:\/\//, "")}`];
    }

    const cover = assetUrl(business.vendor_cover_url);
    if (cover) json.image = cover;
    else if (photos.length > 0) json.image = assetUrl(photos[0].url);

    if (business.vendor_address) {
        json.address = {
            "@type": "PostalAddress",
            streetAddress: business.vendor_address,
            addressLocality: business.area_name ?? "Rajshahi",
            addressRegion: "Rajshahi",
            addressCountry: "BD",
        };
    }

    if (business.vendor_lat && business.vendor_lng) {
        json.geo = {
            "@type": "GeoCoordinates",
            latitude: Number(business.vendor_lat),
            longitude: Number(business.vendor_lng),
        };
    }

    if (categories.length > 0) {
        json.additionalType = categories.map((c) => c.name);
    }

    // Omitted entirely when there are no reviews — a rating of 0 out of 0
    // is invalid, not merely unhelpful.
    if (reviewCount > 0) {
        json.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
        };
    }

    const openingHours = hours
        .filter((h) => !h.is_closed)
        .map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${DAYS[h.day]}`,
            opens: h.is_24h ? "00:00" : h.open_time?.slice(0, 5),
            closes: h.is_24h ? "23:59" : h.close_time?.slice(0, 5),
        }));

    if (openingHours.length > 0) json.openingHoursSpecification = openingHours;

    return (
        <script
            type="application/ld+json"
            // Serialised from our own database rows, and JSON.stringify
            // escapes the content; nothing here is attacker-controlled markup.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
    );
}
