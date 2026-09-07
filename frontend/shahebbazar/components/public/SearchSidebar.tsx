import Link from "next/link";
import { Plus } from "lucide-react";
import { searchHref, type SearchQuery } from "./SearchControls";
import { t, localeHref, pick, type Locale } from "@/lib/i18n";
import { localiseDigits } from "@/lib/format";
import type { Facet } from "@/lib/types";

/** The right-hand rail on the search results page. */
export function SearchSidebar({
    locale,
    query,
    areas,
    categories,
}: {
    locale: Locale;
    query: SearchQuery;
    areas: Facet[];
    categories: Facet[];
}) {
    const copy = t(locale);

    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.searchAreaIn} {copy.heroWhere}
                </h2>
                <AreaMap areas={areas} />
            </section>

            <FacetList
                title={copy.popularAreas}
                footer={copy.viewAllAreas}
                footerHref={localeHref("/categories", locale)}
                items={areas}
                locale={locale}
                hrefFor={(slug) => searchHref(query, { area: slug })}
                suffix={copy.results}
            />

            <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[1.0625rem] font-semibold tracking-tight">
                    {copy.refineSearch}
                </h2>
                <h3 className="mt-3 text-[0.9375rem] font-semibold">{copy.popularCategories}</h3>
                <ul className="mt-3 space-y-2.5">
                    {categories.map((item) => (
                        <li key={item.slug}>
                            <Link
                                href={searchHref(query, { category: item.slug })}
                                className="flex items-baseline justify-between gap-3 text-[0.875rem] hover:text-brand-600"
                            >
                                <span className="truncate">
                                    {pick(locale, item.name, item.name_bn)}
                                </span>
                                <span className="shrink-0 text-[0.8125rem] text-muted">
                                    {localiseDigits(String(item.count), locale)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link
                    href={localeHref("/categories", locale)}
                    className="mt-4 block text-center text-[0.8125rem] font-medium text-brand-600 hover:underline"
                >
                    {copy.viewAllCategories}
                </Link>
            </section>

            <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <h2 className="text-[1.0625rem] font-semibold tracking-tight">{copy.cantFind}</h2>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                    {copy.cantFindBody}
                </p>
                <Link
                    href={localeHref("/vendors/register", locale)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] border border-brand-600 bg-surface px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
                >
                    <Plus className="size-4" />
                    {copy.addYourBusiness}
                </Link>
            </section>
        </div>
    );
}

function FacetList({
    title,
    footer,
    footerHref,
    items,
    locale,
    hrefFor,
    suffix,
}: {
    title: string;
    footer: string;
    footerHref: string;
    items: Facet[];
    locale: Locale;
    hrefFor: (slug: string) => string;
    suffix: string;
}) {
    if (items.length === 0) return null;

    return (
        <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <h2 className="text-[1.0625rem] font-semibold tracking-tight">{title}</h2>
            <ul className="mt-3.5 space-y-2.5">
                {items.map((item) => (
                    <li key={item.slug}>
                        <Link
                            href={hrefFor(item.slug)}
                            className="flex items-baseline justify-between gap-3 text-[0.875rem] hover:text-brand-600"
                        >
                            <span className="truncate">{pick(locale, item.name, item.name_bn)}</span>
                            <span className="shrink-0 text-[0.8125rem] text-muted">
                                {localiseDigits(String(item.count), locale)} {suffix}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link
                href={footerHref}
                className="mt-4 block text-center text-[0.8125rem] font-medium text-brand-600 hover:underline"
            >
                {footer}
            </Link>
        </section>
    );
}

/**
 * A drawn map, not a real one.
 *
 * A live map needs an API key and a paid tier, and the client has not
 * provided either. Rather than leave a grey box or ship a broken embed,
 * this sketches the search area and labels the places that actually have
 * results. Swap it for Leaflet + OpenStreetMap tiles — no key required —
 * when maps become scope.
 */
function AreaMap({ areas }: { areas: Facet[] }) {
    const labels = areas.slice(0, 5).map((a) => a.name);

    return (
        <div className="mt-3 overflow-hidden rounded-lg border border-line">
            <svg viewBox="0 0 300 190" className="w-full" role="img" aria-label="Search area map">
                <rect width="300" height="190" className="fill-emerald-50" />
                {/* River */}
                <path
                    d="M-5 150 C 60 130, 110 175, 180 150 S 280 120, 305 140 L305 195 L-5 195 Z"
                    className="fill-sky-200/70"
                />
                {/* Roads */}
                <g className="stroke-amber-200" strokeWidth="6" fill="none">
                    <path d="M0 70 H300" />
                    <path d="M120 0 V190" />
                    <path d="M215 0 L245 190" />
                </g>
                {/* Search radius */}
                <circle cx="150" cy="92" r="52" className="fill-brand-500/15 stroke-brand-400/60" />
                {/* Area labels, positioned around the radius */}
                <g className="fill-slate-600 text-[9px]" fontSize="9">
                    {labels[0] && <text x="150" y="60" textAnchor="middle">{labels[0]}</text>}
                    {labels[1] && <text x="58" y="46" textAnchor="middle">{labels[1]}</text>}
                    {labels[2] && <text x="252" y="52" textAnchor="middle">{labels[2]}</text>}
                    {labels[3] && <text x="248" y="128" textAnchor="middle">{labels[3]}</text>}
                    {labels[4] && <text x="56" y="132" textAnchor="middle">{labels[4]}</text>}
                </g>
                {/* Centre pin */}
                <g transform="translate(150 92)">
                    <circle r="13" className="fill-brand-600" />
                    <circle r="4.5" cy="-1" className="fill-white" />
                </g>
            </svg>
        </div>
    );
}

