import Link from "next/link";
import {
    Award,
    BadgeCheck,
    Bookmark,
    Building2,
    CalendarDays,
    ExternalLink,
    Images,
    MapPin,
    MessageSquare,
    Navigation,
    Phone,
    Share2,
    Star,
} from "lucide-react";
import { assetUrl } from "@/lib/api";
import { t, localeHref, pick, type Locale } from "@/lib/i18n";
import { formatClockTime, formatRating, localiseDigits, toNumber } from "@/lib/format";
import type { BusinessDetail } from "@/lib/types";

/**
 * The main column of a business profile.
 *
 * The design shows tabs across the top (Overview / Services / Reviews /
 * Photos / About). They are rendered as anchor links to sections on the
 * same page rather than as JavaScript tab panels, for two reasons: the
 * whole profile stays in the HTML for crawlers, which is the point of this
 * page, and it needs no client component.
 */
export function BusinessProfile({
    locale,
    detail,
}: {
    locale: Locale;
    detail: BusinessDetail;
}) {
    const copy = t(locale);
    const { business, categories, photos, listings, facts, reviews, ratingDistribution } = detail;

    const name = pick(locale, business.vendor_name, business.vendor_name_bn);
    const cover = assetUrl(business.vendor_cover_url);
    const aboutFacts = facts.filter((f) => f.group === "about");
    const reviewCount = toNumber(business.review_count);
    const closes = formatClockTime(business.close_time_today);

    const sections = [
        { id: "overview", label: copy.overview },
        { id: "services", label: copy.services },
        { id: "reviews", label: copy.tabReviews },
        { id: "photos", label: copy.photos },
    ];

    return (
        <div className="min-w-0 space-y-5">
            {/* ---------------------------------------------- header ---- */}
            <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                <div className="relative h-[200px] bg-gradient-to-br from-brand-100 to-brand-200 sm:h-[260px]">
                    {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={cover}
                            alt={`${name} — cover photograph`}
                            className="size-full object-cover"
                        />
                    )}

                    {photos.length > 0 && (
                        <a
                            href="#photos"
                            className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 text-[0.8125rem] font-medium text-white backdrop-blur transition-colors hover:bg-black/75"
                        >
                            <Images className="size-4" />
                            {copy.seeAllPhotos} ({localiseDigits(String(photos.length), locale)})
                        </a>
                    )}
                </div>

                <div className="px-5 pb-5 sm:px-6">
                    <div className="relative z-10 -mt-10 flex items-end gap-4 sm:-mt-12">
                        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-surface bg-brand-50 sm:size-24">
                            {business.vendor_logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={assetUrl(business.vendor_logo_url) ?? ""}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-brand-600">
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight">
                                {name}
                                {business.is_verified && (
                                    <BadgeCheck
                                        className="size-5 shrink-0 fill-brand-600 text-white"
                                        aria-label={copy.verified}
                                    />
                                )}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.875rem]">
                                <span className="flex items-center gap-1 font-medium">
                                    <Star className="size-4 fill-star text-star" />
                                    {localiseDigits(formatRating(business.rating), locale)}
                                    <span className="font-normal text-muted">
                                        ({localiseDigits(String(reviewCount), locale)} {copy.reviews})
                                    </span>
                                </span>

                                {business.open_state && (
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
                                            business.open_state === "open"
                                                ? "bg-open-bg text-open-ink"
                                                : "bg-shut-bg text-shut-ink"
                                        }`}
                                    >
                                        {business.open_state === "open" ? copy.open : copy.closed}
                                    </span>
                                )}

                                {business.open_state === "open" && closes && (
                                    <span className="text-muted">
                                        {copy.closesAt} {closes}
                                    </span>
                                )}
                            </div>

                            {categories.length > 0 && (
                                <p className="mt-2 text-[0.875rem] text-muted">
                                    {categories
                                        .map((c) => pick(locale, c.name, c.name_bn))
                                        .join(" • ")}
                                </p>
                            )}

                            {business.vendor_address && (
                                <p className="mt-2 flex items-start gap-1.5 text-[0.875rem] text-muted">
                                    <MapPin className="mt-0.5 size-4 shrink-0" />
                                    {business.vendor_address}
                                </p>
                            )}
                        </div>

                        <ActionButtons locale={locale} detail={detail} />
                    </div>
                </div>

                {/* Anchor links, not JavaScript tabs — see the note above. */}
                <nav
                    aria-label="Sections"
                    className="flex gap-1 overflow-x-auto border-t border-line px-5 sm:px-6"
                >
                    {sections.map((section, index) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className={`shrink-0 border-b-2 px-3 py-3 text-[0.875rem] font-medium transition-colors ${
                                index === 0
                                    ? "border-brand-600 text-brand-600"
                                    : "border-transparent text-muted hover:text-ink"
                            }`}
                        >
                            {section.label}
                        </a>
                    ))}
                </nav>
            </section>

            {/* -------------------------------------------- overview ---- */}
            <section
                id="overview"
                className="scroll-mt-20 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
                aria-labelledby="overview-heading"
            >
                <h2 id="overview-heading" className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.aboutHeading} {name}
                </h2>

                <div className="mt-3 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <p className="text-[0.875rem] leading-relaxed text-muted">
                        {business.vendor_description}
                    </p>

                    {(aboutFacts.length > 0 || business.vendor_website) && (
                        <dl className="space-y-2.5">
                            {aboutFacts.map((fact) => (
                                <div
                                    key={fact.label}
                                    className="flex items-baseline justify-between gap-4 text-[0.875rem]"
                                >
                                    <dt className="flex items-center gap-2 text-muted">
                                        <FactIcon name={fact.icon} />
                                        {fact.label}
                                    </dt>
                                    <dd className="text-right font-medium">
                                        {localiseDigits(fact.value, locale)}
                                    </dd>
                                </div>
                            ))}

                            {business.vendor_website && (
                                <div className="flex items-baseline justify-between gap-4 text-[0.875rem]">
                                    <dt className="flex items-center gap-2 text-muted">
                                        <ExternalLink className="size-4" />
                                        {copy.website}
                                    </dt>
                                    <dd className="text-right">
                                        <a
                                            href={`https://${business.vendor_website.replace(/^https?:\/\//, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="font-medium text-brand-600 hover:underline"
                                        >
                                            {business.vendor_website}
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    )}
                </div>
            </section>

            {/* -------------------------------------------- services ---- */}
            <section
                id="services"
                className="scroll-mt-20 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
                aria-labelledby="services-heading"
            >
                <h2 id="services-heading" className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.servicesHeading}
                </h2>

                {listings.length === 0 ? (
                    <p className="mt-4 text-[0.875rem] text-muted">{copy.noServices}</p>
                ) : (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((item) => {
                            const price = toNumber(item.price);
                            return (
                                <li
                                    key={item.listing_id}
                                    className="rounded-xl border border-line p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50"
                                >
                                    <h3 className="text-[0.875rem] font-semibold">
                                        {pick(locale, item.title, item.title_bn)}
                                    </h3>
                                    {item.description && (
                                        <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-muted">
                                            {item.description}
                                        </p>
                                    )}
                                    {price > 0 && (
                                        <p className="mt-2 text-[0.8125rem] font-medium text-brand-700">
                                            ৳{localiseDigits(price.toLocaleString("en-US"), locale)}
                                            {item.unit && (
                                                <span className="font-normal text-muted">
                                                    {" "}
                                                    / {item.unit}
                                                </span>
                                            )}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {/* --------------------------------------------- reviews ---- */}
            <section
                id="reviews"
                className="scroll-mt-20 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
                aria-labelledby="reviews-heading"
            >
                <h2 id="reviews-heading" className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.ratingsReviews}
                </h2>

                <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
                    <div>
                        <div className="text-center">
                            <p className="text-[3rem] leading-none font-bold">
                                {localiseDigits(formatRating(business.rating), locale)}
                            </p>
                            <div className="mt-2 flex justify-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        className={`size-4 ${
                                            i <= Math.round(toNumber(business.rating))
                                                ? "fill-star text-star"
                                                : "fill-slate-200 text-slate-200"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="mt-1.5 text-[0.8125rem] text-muted">
                                {localiseDigits(String(reviewCount), locale)} {copy.totalReviews}
                            </p>
                        </div>

                        <ul className="mt-4 space-y-1.5">
                            {ratingDistribution.map((row) => {
                                const pct = reviewCount ? (row.count / reviewCount) * 100 : 0;
                                return (
                                    <li key={row.rating} className="flex items-center gap-2">
                                        <span className="flex w-6 shrink-0 items-center gap-0.5 text-[0.75rem] text-muted">
                                            {localiseDigits(String(row.rating), locale)}
                                            <Star className="size-2.5 fill-star text-star" />
                                        </span>
                                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                            <span
                                                className="block h-full rounded-full bg-brand-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </span>
                                        <span className="w-6 shrink-0 text-right text-[0.75rem] text-muted">
                                            {localiseDigits(String(row.count), locale)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Needs an account, so it points at sign-in rather
                            than a form that cannot submit. */}
                        <Link
                            href={localeHref("/login", locale)}
                            className="mt-4 flex w-full items-center justify-center rounded-[10px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            {copy.writeReview}
                        </Link>
                    </div>

                    <div>
                        <h3 className="text-[0.9375rem] font-semibold">{copy.whatPeopleSay}</h3>
                        {reviews.length === 0 ? (
                            <p className="mt-3 text-[0.875rem] text-muted">{copy.noReviews}</p>
                        ) : (
                            <ul className="mt-3 space-y-4">
                                {reviews.map((review) => (
                                    <li
                                        key={review.review_id}
                                        className="rounded-xl border border-line p-4"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-[0.8125rem] font-semibold text-brand-700">
                                                {review.author.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="flex items-center gap-1.5 text-[0.875rem] font-semibold">
                                                    {review.author}
                                                    {review.author_verified && (
                                                        <BadgeCheck className="size-3.5 shrink-0 fill-brand-600 text-white" />
                                                    )}
                                                </span>
                                                <span className="block text-[0.75rem] text-soft">
                                                    {relativeTime(review.created_at)}
                                                </span>
                                            </span>
                                            <span className="ml-auto flex shrink-0 gap-0.5">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <Star
                                                        key={i}
                                                        className={`size-3.5 ${
                                                            i <= review.rating
                                                                ? "fill-star text-star"
                                                                : "fill-slate-200 text-slate-200"
                                                        }`}
                                                    />
                                                ))}
                                            </span>
                                        </div>
                                        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted">
                                            {review.body}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------- photos ---- */}
            {photos.length > 0 && (
                <section
                    id="photos"
                    className="scroll-mt-20 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
                    aria-labelledby="photos-heading"
                >
                    <h2
                        id="photos-heading"
                        className="text-[1.0625rem] font-semibold tracking-tight"
                    >
                        {copy.photos}
                    </h2>
                    <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {photos.map((photo, index) => (
                            <li
                                key={`${photo.url}-${index}`}
                                className="aspect-4/3 overflow-hidden rounded-lg bg-brand-50"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={assetUrl(photo.url) ?? ""}
                                    alt={photo.alt ?? ""}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

function ActionButtons({ locale, detail }: { locale: Locale; detail: BusinessDetail }) {
    const copy = t(locale);
    const { business } = detail;
    const lat = business.vendor_lat;
    const lng = business.vendor_lng;

    const directionsUrl =
        lat && lng
            ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${business.vendor_name} ${business.vendor_address ?? "Rajshahi"}`
              )}`;

    // WhatsApp rather than the Web Share API: sharing has to work without
    // JavaScript, and WhatsApp is how a link actually travels here.
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(
        `${business.vendor_name} — ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/business/${business.vendor_slug}`
    )}`;

    return (
        <div className="grid shrink-0 grid-cols-2 gap-2 lg:w-[260px]">
            <a
                href={`tel:${business.vendor_phone}`}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
                <Phone className="size-4" />
                {copy.call}
            </a>

            {/* Messaging needs an account and the inbox is not built, so
                this goes to sign-in rather than nowhere. */}
            <Link
                href={localeHref("/login", locale)}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-600 hover:bg-brand-50"
            >
                <MessageSquare className="size-4" />
                {copy.message}
            </Link>

            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
            >
                <Navigation className="size-4" />
                {copy.getDirections}
            </a>

            <Link
                href={localeHref("/login", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
            >
                <Bookmark className="size-4" />
                {copy.save}
            </Link>

            <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
            >
                <Share2 className="size-4" />
                {copy.share}
            </a>
        </div>
    );
}

function FactIcon({ name }: { name: string | null }) {
    const map: Record<string, typeof Award> = {
        calendar: CalendarDays,
        badge: Award,
        building: Building2,
    };
    const Icon = (name && map[name]) || Award;
    return <Icon className="size-4" />;
}

/** "2 weeks ago" — computed on the server, so no hydration mismatch. */
function relativeTime(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days < 1) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
    if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
    return `${Math.floor(days / 365)} year${days < 730 ? "" : "s"} ago`;
}
