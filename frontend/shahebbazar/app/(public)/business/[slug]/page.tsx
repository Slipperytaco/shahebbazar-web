import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/public/AppShell";
import { BusinessProfile } from "@/components/public/BusinessProfile";
import { BusinessSidebar } from "@/components/public/BusinessSidebar";
import { PaymentMethodsCard } from "@/components/payments/PaymentMethodsCard";
import { assetUrl, getBusiness, getPaymentMethods } from "@/lib/api";
import { resolveLocale, t, localeHref } from "@/lib/i18n";
import { toNumber } from "@/lib/format";
import { paymentMethodOption } from "@/lib/paymentMethods";
import type { BusinessDetail, PaymentMethod } from "@/lib/types";

/**
 * Business profile page.
 *
 * Server-rendered at a stable slug URL and annotated with `LocalBusiness`
 * structured data, so the complete record is available to crawlers.
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
        // Per-business OpenGraph tags for link preview cards.
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

    const [detail, paymentMethods] = await Promise.all([
        getBusiness(slug),
        getPaymentMethods(slug),
    ]);

    // Unknown or unapproved records return 404. The API serves approved
    // businesses only.
    if (!detail) notFound();

    return (
        <AppShell locale={locale} current="/search">
            <LocalBusinessJsonLd detail={detail} paymentMethods={paymentMethods} />
            <ProductJsonLd detail={detail} />

            <Link
                href={localeHref("/search", locale)}
                className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-brand-600 hover:underline"
            >
                <ChevronLeft className="size-4" />
                {copy.backToResults}
            </Link>

            <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <BusinessProfile locale={locale} detail={detail} />
                <div className="space-y-5">
                    <BusinessSidebar locale={locale} detail={detail} />
                    {paymentMethods && (
                        <PaymentMethodsCard locale={locale} methods={paymentMethods} />
                    )}
                </div>
            </div>
        </AppShell>
    );
}

/**
 * `LocalBusiness` structured data.
 *
 * Only populated fields are emitted. Incomplete properties, such as an
 * `aggregateRating` with no reviews, are invalid and are reported as
 * errors by search engines rather than ignored.
 */
function LocalBusinessJsonLd({
    detail,
    paymentMethods,
}: {
    detail: BusinessDetail;
    paymentMethods: PaymentMethod[] | null;
}) {
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
        "@id": `${siteUrl}/business/${business.vendor_slug}#business`,
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

    // Omitted when no reviews exist; a zero-count rating is invalid.
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

    const accepted = (paymentMethods ?? [])
        .map((m) => paymentMethodOption(m.payment_method)?.label)
        .filter(Boolean);
    if (accepted.length > 0) json.paymentAccepted = accepted.join(", ");

    return (
        <script
            type="application/ld+json"
            // Serialised with JSON.stringify, which escapes the content.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
    );
}

// One Product node per listing. A range becomes an AggregateOffer, a single
// price an Offer, and a listing with no price gets no offers at all — a zero
// there reads as free.
function ProductJsonLd({ detail }: { detail: BusinessDetail }) {
    const { business, listings } = detail;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const pageUrl = `${siteUrl}/business/${business.vendor_slug}`;

    const seller = {
        "@type": "LocalBusiness",
        "@id": `${pageUrl}#business`,
        name: business.vendor_name,
    };

    const products = listings.map((item) => {
        const price = toNumber(item.price);
        const priceMax = toNumber(item.price_max);

        const product: Record<string, unknown> = {
            "@type": "Product",
            "@id": `${pageUrl}#listing-${item.listing_id}`,
            name: item.title,
            url: `${pageUrl}#services`,
        };

        if (item.description) product.description = item.description;

        if (price > 0 && priceMax > price) {
            product.offers = {
                "@type": "AggregateOffer",
                priceCurrency: "BDT",
                lowPrice: price,
                highPrice: priceMax,
                availability: "https://schema.org/InStock",
                seller,
            };
        } else if (price > 0) {
            product.offers = {
                "@type": "Offer",
                priceCurrency: "BDT",
                price,
                availability: "https://schema.org/InStock",
                seller,
            };
        }

        if (item.min_order_qty) {
            product.additionalProperty = {
                "@type": "PropertyValue",
                name: "Minimum order quantity",
                value: item.min_order_qty,
                unitText: item.unit ?? undefined,
            };
        }

        return product;
    });

    // An empty @graph is invalid, so a business with no listings emits nothing.
    if (products.length === 0) return null;

    return (
        <script
            type="application/ld+json"
            // Serialised with JSON.stringify, which escapes the content.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({ "@context": "https://schema.org", "@graph": products }),
            }}
        />
    );
}
