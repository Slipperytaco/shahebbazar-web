import Link from "next/link";
import { Radar, Star, Users, type LucideIcon } from "lucide-react";
import { t, localeHref, pick, type Locale } from "@/lib/i18n";
import { formatEventDate, formatEventRange } from "@/lib/format";
import type { EventItem } from "@/lib/types";

/** The three cards down the right-hand side of the home page. */

export function WhyShahebbazar({ locale }: { locale: Locale }) {
    const copy = t(locale);

    const reasons: { Icon: LucideIcon; title: string; body: string; tint: string }[] = [
        {
            Icon: Radar,
            title: copy.whyDiscoverTitle,
            body: copy.whyDiscoverBody,
            tint: "bg-sky-50 text-sky-600",
        },
        {
            Icon: Star,
            title: copy.whyReviewsTitle,
            body: copy.whyReviewsBody,
            tint: "bg-amber-50 text-amber-600",
        },
        {
            Icon: Users,
            title: copy.whySupportTitle,
            body: copy.whySupportBody,
            tint: "bg-violet-50 text-violet-600",
        },
    ];

    return (
        <section
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
            aria-labelledby="why-shahebbazar"
        >
            <h2 id="why-shahebbazar" className="text-[1.0625rem] font-semibold tracking-tight">
                {copy.whyTitle}
            </h2>
            <ul className="mt-4 space-y-4">
                {reasons.map(({ Icon, title, body, tint }) => (
                    <li key={title} className="flex gap-3">
                        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tint}`}>
                            <Icon className="size-[17px]" strokeWidth={1.75} />
                        </span>
                        <span>
                            <span className="block text-sm leading-tight font-semibold">
                                {title}
                            </span>
                            <span className="mt-1 block text-[0.8125rem] leading-snug text-muted">
                                {body}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function PopularSearches({ locale, terms }: { locale: Locale; terms: string[] }) {
    const copy = t(locale);
    if (terms.length === 0) return null;

    return (
        <section
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
            aria-labelledby="popular-searches"
        >
            <h2 id="popular-searches" className="text-[1.0625rem] font-semibold tracking-tight">
                {copy.popularSearches}
            </h2>
            <ul className="mt-3.5 flex flex-wrap gap-2">
                {terms.map((term) => (
                    <li key={term}>
                        <Link
                            href={localeHref(`/search?q=${encodeURIComponent(term)}`, locale)}
                            className="inline-flex items-center rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[0.8125rem] text-muted capitalize transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                        >
                            {term}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function UpcomingEvents({ locale, events }: { locale: Locale; events: EventItem[] }) {
    const copy = t(locale);

    return (
        <section
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
            aria-labelledby="upcoming-events"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="upcoming-events" className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.upcomingEvents}
                </h2>
                <Link
                    href={localeHref("/events", locale)}
                    className="text-[0.8125rem] font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                    {copy.viewAll}
                </Link>
            </div>

            {events.length === 0 ? (
                <p className="py-4 text-center text-[0.8125rem] text-muted">{copy.noEvents}</p>
            ) : (
                <>
                    <ul className="space-y-3.5">
                        {events.map((event) => {
                            const { month, day } = formatEventDate(event.event_starts_at);
                            return (
                                <li key={event.event_id} className="flex gap-3">
                                    <span
                                        className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-50 leading-none"
                                        aria-hidden
                                    >
                                        <span className="text-[0.625rem] font-semibold text-brand-600">
                                            {month}
                                        </span>
                                        <span className="text-[1.0625rem] font-bold text-ink">
                                            {day}
                                        </span>
                                    </span>
                                    <span className="min-w-0">
                                        <Link
                                            href={localeHref(
                                                `/events/${event.event_slug}`,
                                                locale
                                            )}
                                            className="block truncate text-sm font-semibold hover:text-brand-600"
                                        >
                                            {pick(locale, event.event_title, event.event_title_bn)}
                                        </Link>
                                        {event.event_venue && (
                                            <span className="mt-0.5 block truncate text-[0.8125rem] text-muted">
                                                {event.event_venue}
                                            </span>
                                        )}
                                        <span className="mt-0.5 block text-xs text-soft">
                                            {formatEventRange(
                                                event.event_starts_at,
                                                event.event_ends_at
                                            )}
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <Link
                        href={localeHref("/events", locale)}
                        className="mt-4 flex w-full items-center justify-center rounded-[10px] border border-line-strong bg-surface px-[1.125rem] py-2.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-600 hover:bg-brand-50"
                    >
                        {copy.viewAllEvents}
                    </Link>
                </>
            )}
        </section>
    );
}
