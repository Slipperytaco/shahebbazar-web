import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { AppShell } from "@/components/public/AppShell";
import { apiGet } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { resolveLocale, t, localeHref, pick, type Locale } from "@/lib/i18n";
import { formatEventDate, formatEventRange } from "@/lib/format";
import type { EventDetail } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
    title: "Events in Rajshahi",
    description: "Fairs, festivals and trade events around Rajshahi and Shaheb Bazar.",
    path: "/events",
});

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
    const locale = resolveLocale((await searchParams).lang);
    const copy = t(locale);
    const data = (await apiGet<{ upcoming: EventDetail[]; past: EventDetail[] }>("/events").catch(() => null)) ?? {
        upcoming: [],
        past: [],
    };

    return (
        <AppShell locale={locale} current="/events">
            <h1 className="text-2xl font-bold tracking-tight">{copy.eventsHeading}</h1>

            <h2 className="mt-5 text-[1.0625rem] font-semibold">{copy.upcomingEvents}</h2>
            {data.upcoming.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{copy.noEvents}</p>
            ) : (
                <EventGrid events={data.upcoming} locale={locale} />
            )}

            {data.past.length > 0 && (
                <>
                    <h2 className="mt-8 text-[1.0625rem] font-semibold">{copy.pastEvents}</h2>
                    <EventGrid events={data.past} locale={locale} />
                </>
            )}
        </AppShell>
    );
}

function EventGrid({ events, locale }: { events: EventDetail[]; locale: Locale }) {
    return (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
                const { month, day } = formatEventDate(event.event_starts_at);
                return (
                    <li key={event.event_id} className="flex gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
                        <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-brand-50 leading-none" aria-hidden>
                            <span className="text-[0.6875rem] font-semibold text-brand-600">{month}</span>
                            <span className="text-xl font-bold">{day}</span>
                        </span>
                        <span className="min-w-0">
                            <Link
                                href={localeHref(`/events/${event.event_slug}`, locale)}
                                className="font-semibold hover:text-brand-600"
                            >
                                {pick(locale, event.event_title, event.event_title_bn)}
                            </Link>
                            {event.event_venue && (
                                <span className="mt-1 flex items-center gap-1 text-[0.8125rem] text-muted">
                                    <MapPin className="size-3.5" /> {event.event_venue}
                                </span>
                            )}
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-soft">
                                <CalendarDays className="size-3.5" /> {formatEventRange(event.event_starts_at, event.event_ends_at)}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
