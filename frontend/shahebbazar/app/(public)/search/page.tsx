import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/public/AppShell";
import { SearchControls, searchHref, type SearchQuery } from "@/components/public/SearchControls";
import { SearchResultRow } from "@/components/public/SearchResultRow";
import { SearchSidebar } from "@/components/public/SearchSidebar";
import { getHomeData, searchBusinesses } from "@/lib/api";
import { resolveLocale, t, localeHref } from "@/lib/i18n";
import { localiseDigits } from "@/lib/format";

/**
 * Search results.
 *
 * A server component: results are in the HTML before any JavaScript runs,
 * and every filter combination has its own URL, so a filtered view can be
 * linked, bookmarked and crawled.
 */

const PAGE_SIZE = 20;

type Params = {
    q?: string;
    category?: string;
    area?: string;
    sort?: string;
    page?: string;
    lang?: string;
};

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<Params>;
}): Promise<Metadata> {
    const { q } = await searchParams;
    const title = q
        ? `${q} in Rajshahi — search results`
        : "Browse businesses in Rajshahi";

    return {
        title,
        description: q
            ? `Businesses and services matching "${q}" in Rajshahi. Compare ratings, opening hours and contact details on Shahebbazar.`
            : "Browse trusted businesses and services across Rajshahi by category and area.",
        // A results page for an arbitrary query is thin content and there
        // are unlimited variations of it. Let Google follow the links to
        // the shop pages, which are the pages worth indexing.
        robots: { index: false, follow: true },
    };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
    const params = await searchParams;
    const locale = resolveLocale(params.lang);
    const copy = t(locale);

    const page = Math.max(parseInt(params.page ?? "1", 10) || 1, 1);
    const offset = (page - 1) * PAGE_SIZE;

    // Categories come from the home payload, which is already cached — no
    // reason to ask the API for the taxonomy twice.
    const [data, home] = await Promise.all([
        searchBusinesses({
            q: params.q,
            category: params.category,
            area: params.area,
            sort: params.sort,
            limit: PAGE_SIZE,
            offset,
        }),
        getHomeData(),
    ]);

    const query: SearchQuery = {
        q: params.q,
        category: params.category,
        area: params.area,
        sort: params.sort,
        lang: locale === "bn" ? "bn" : undefined,
    };

    // Promoted rows are displayed too, so they count towards "showing N of M".
    const shownOnPage = data.sponsored.length + data.results.length;
    const firstRow = shownOnPage === 0 ? 0 : offset + 1;
    const lastRow = offset + shownOnPage;
    // Based on what came back rather than on the total, because the total
    // includes promoted rows that are not part of the paginated set.
    const hasMore = data.results.length === PAGE_SIZE;
    const nothingFound = shownOnPage === 0;
    const num = (n: number) => localiseDigits(String(n), locale);

    return (
        <AppShell locale={locale} current="/search">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-1.5 text-[0.8125rem] text-muted"
                    >
                        <Link href={localeHref("/", locale)} className="hover:text-brand-600">
                            {copy.home}
                        </Link>
                        <ChevronRight className="size-3.5" />
                        <span className="text-ink">{copy.searchResults}</span>
                    </nav>

                    <h1 className="mt-3 text-[1.75rem] leading-tight font-bold tracking-tight">
                        {params.q ? (
                            <>
                                {copy.searchResultsFor} <span>&ldquo;{params.q}&rdquo;</span>{" "}
                                {copy.inLocation}{" "}
                                <span className="text-brand-600">{copy.heroWhere}</span>
                            </>
                        ) : (
                            <>
                                {copy.allBusinesses}{" "}
                                <span className="text-brand-600">{copy.heroWhere}</span>
                            </>
                        )}
                    </h1>

                    <p className="mt-1.5 text-[0.875rem] text-muted">
                        {copy.showing} {num(firstRow)}–{num(lastRow)} {copy.of} {num(data.total)}{" "}
                        {copy.results}
                    </p>

                    <div className="mt-5">
                        <SearchControls
                            locale={locale}
                            query={query}
                            categories={home.categories}
                            areas={data.facets.areas}
                        />
                    </div>

                    {/*
                      Promoted shops sit above the organic list in their own
                      block, each labelled. They are never mixed into the
                      results — presenting paid placement as an organic
                      ranking is misleading conduct under the ACS code.
                    */}
                    {data.sponsored.length > 0 && (
                        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                            {data.sponsored.map((business) => (
                                <li key={`sponsored-${business.vendor_id}`}>
                                    <SearchResultRow locale={locale} business={business} sponsored />
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Only when nothing at all is on screen — a page showing
                        a promoted shop must not also say "no matches". */}
                    {nothingFound ? (
                        <div className="mt-5 rounded-xl border border-line bg-surface p-12 text-center shadow-card">
                            <p className="font-medium">{copy.noResults}</p>
                            <p className="mt-1.5 text-[0.875rem] text-muted">{copy.noResultsHint}</p>
                            <Link
                                href={locale === "bn" ? "/search?lang=bn" : "/search"}
                                className="mt-5 inline-flex items-center justify-center rounded-[10px] border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-600 hover:bg-brand-50"
                            >
                                {copy.clearAll}
                            </Link>
                        </div>
                    ) : data.results.length > 0 ? (
                        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
                            {data.results.map((business) => (
                                <li key={business.vendor_id}>
                                    <SearchResultRow locale={locale} business={business} />
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {(page > 1 || hasMore) && (
                        <nav
                            aria-label="Pagination"
                            className="mt-5 flex items-center justify-between gap-3"
                        >
                            {page > 1 ? (
                                <Link
                                    href={`${searchHref(query, {})}${
                                        searchHref(query, {}).includes("?") ? "&" : "?"
                                    }page=${page - 1}`}
                                    className="inline-flex items-center rounded-[10px] border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:border-brand-600 hover:text-brand-600"
                                >
                                    {copy.previous}
                                </Link>
                            ) : (
                                <span />
                            )}

                            {hasMore && (
                                <Link
                                    href={`${searchHref(query, {})}${
                                        searchHref(query, {}).includes("?") ? "&" : "?"
                                    }page=${page + 1}`}
                                    className="inline-flex items-center rounded-[10px] border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:border-brand-600 hover:text-brand-600"
                                >
                                    {copy.next}
                                </Link>
                            )}
                        </nav>
                    )}
                </div>

                <SearchSidebar
                    locale={locale}
                    query={query}
                    areas={data.facets.areas}
                    categories={data.facets.categories}
                />
            </div>
        </AppShell>
    );
}
