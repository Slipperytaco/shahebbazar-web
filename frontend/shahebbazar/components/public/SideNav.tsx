import Link from "next/link";
import {
    BookOpen,
    CalendarDays,
    Home,
    LayoutGrid,
    SquarePlus,
    Store,
    TicketPercent,
    type LucideIcon,
} from "lucide-react";
import { t, localeHref, type Locale } from "@/lib/i18n";

/**
 * Left rail: primary navigation plus the "Explore Rajshahi" card.
 *
 * Hidden below `lg`, where the layout collapses to a single column. The
 * client's brief says most visitors arrive on a phone, so this rail is the
 * first thing to go rather than something to squeeze in.
 */

interface NavLink {
    key: keyof ReturnType<typeof t>;
    href: string;
    Icon: LucideIcon;
}

const LINKS: NavLink[] = [
    { key: "navHome", href: "/", Icon: Home },
    { key: "navBusinesses", href: "/search", Icon: Store },
    { key: "navCategories", href: "/categories", Icon: LayoutGrid },
    { key: "navDeals", href: "/deals", Icon: TicketPercent },
    { key: "navEvents", href: "/events", Icon: CalendarDays },
    { key: "navBlog", href: "/blog", Icon: BookOpen },
    { key: "navAddBusiness", href: "/vendors/register", Icon: SquarePlus },
];

export function SideNav({ locale, current = "/" }: { locale: Locale; current?: string }) {
    const copy = t(locale);

    return (
        <aside className="hidden w-[236px] shrink-0 lg:block">
            <nav
                aria-label="Main"
                className="rounded-xl border border-line bg-surface p-2 shadow-card"
            >
                <ul className="space-y-0.5">
                    {LINKS.map(({ key, href, Icon }) => {
                        const active = href === current;
                        return (
                            <li key={href}>
                                <Link
                                    href={localeHref(href, locale)}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm transition-colors ${
                                        active
                                            ? "bg-brand-50 font-semibold text-brand-600"
                                            : "font-medium text-muted hover:bg-surface-2 hover:text-ink"
                                    }`}
                                >
                                    <Icon className="size-[19px]" strokeWidth={1.75} />
                                    <span>{copy[key]}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="mt-4 rounded-xl border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[1.0625rem] font-semibold">{copy.exploreTitle}</h2>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                    {copy.exploreBody}
                </p>
                <CityIllustration />
                <Link
                    href={localeHref("/about", locale)}
                    className="mt-1 flex w-full items-center justify-center rounded-[10px] border border-line-strong bg-surface px-[1.125rem] py-2.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-600 hover:bg-brand-50"
                >
                    {copy.learnMore}
                </Link>
            </div>
        </aside>
    );
}

/**
 * Rajshahi skyline, drawn rather than photographed.
 *
 * Inline SVG costs no request and cannot 404 on the client's VPS, which a
 * stock photograph in /public eventually would. This is artwork, not an
 * icon, so it is not a job for the icon library.
 */
function CityIllustration() {
    return (
        <svg
            viewBox="0 0 240 130"
            className="my-4 w-full"
            role="img"
            aria-label="Illustration of the Rajshahi skyline"
        >
            <circle cx="176" cy="42" r="17" className="fill-amber-300/55" />
            <g className="fill-brand-200/50">
                <ellipse cx="52" cy="30" rx="20" ry="7" />
                <ellipse cx="196" cy="22" rx="16" ry="5.5" />
            </g>
            <g className="fill-brand-500/30">
                <rect x="14" y="66" width="34" height="46" rx="2" />
                <rect x="186" y="72" width="32" height="40" rx="2" />
            </g>
            <g className="fill-brand-600/40">
                {/* Central domed building */}
                <rect x="96" y="58" width="48" height="54" />
                <path d="M120 34c9 8 14 15 14 21h-28c0-6 5-13 14-21z" />
                <rect x="118" y="26" width="4" height="10" rx="2" />
                {/* Flanking minarets */}
                <rect x="80" y="48" width="12" height="64" rx="2" />
                <path d="M86 36c4 5 6 9 6 12H80c0-3 2-7 6-12z" />
                <rect x="148" y="48" width="12" height="64" rx="2" />
                <path d="M154 36c4 5 6 9 6 12h-12c0-3 2-7 6-12z" />
                {/* Arcade */}
                <rect x="54" y="80" width="26" height="32" rx="2" />
                <rect x="160" y="80" width="26" height="32" rx="2" />
            </g>
            <g className="fill-surface/85">
                <rect x="104" y="72" width="8" height="16" rx="4" />
                <rect x="116" y="72" width="8" height="16" rx="4" />
                <rect x="128" y="72" width="8" height="16" rx="4" />
            </g>
            <rect x="0" y="112" width="240" height="18" className="fill-brand-500/15" />
        </svg>
    );
}
