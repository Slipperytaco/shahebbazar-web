import { MapPin, Search } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

/**
 * The hero panel: headline, and the two-field search that is the whole
 * point of a directory — what you want, and where.
 *
 * A real GET form again, so the result is a linkable `/search?q=…&where=…`
 * URL that Google can crawl and a user can bookmark.
 */
export function Hero({ locale }: { locale: Locale }) {
    const copy = t(locale);

    return (
        <section className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-50 via-brand-50 to-brand-100" />

            {/* Decorative only, so it is hidden from assistive tech and
                dropped entirely on small screens where it would squeeze
                the search field. */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-0 right-0 hidden h-full w-[30%] md:block"
            >
                <HeroArtwork />
            </div>

            <div className="relative px-6 py-10 sm:px-10 sm:py-12 md:max-w-[72%]">
                <h1 className="max-w-[19ch] text-[2rem] leading-[1.15] font-bold tracking-tight sm:text-[2.5rem]">
                    {copy.heroTitleA} <span className="text-brand-600">{copy.heroTitleB}</span>
                </h1>
                <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                    {copy.heroSubtitle}
                </p>

                <form
                    action="/search"
                    method="get"
                    role="search"
                    className="mt-7 flex flex-col gap-2 rounded-xl border border-line-strong bg-surface p-2 shadow-raised sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-soft" />
                        <label htmlFor="hero-q" className="sr-only">
                            {copy.heroWhat}
                        </label>
                        <input
                            id="hero-q"
                            name="q"
                            type="search"
                            placeholder={copy.heroWhat}
                            className="h-11 w-full rounded-lg border-0 bg-transparent pr-3 pl-10 text-sm text-ink outline-none placeholder:text-soft"
                        />
                    </div>

                    <div className="hidden h-6 w-px bg-line-strong sm:block" />

                    <div className="relative sm:w-[144px] sm:shrink-0">
                        <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-soft" />
                        <label htmlFor="hero-where" className="sr-only">
                            {copy.heroWhere}
                        </label>
                        <input
                            id="hero-where"
                            name="where"
                            type="text"
                            defaultValue={copy.heroWhere}
                            className="h-11 w-full rounded-lg border-0 bg-transparent pr-3 pl-10 text-sm text-ink outline-none"
                        />
                    </div>

                    {locale === "bn" && <input type="hidden" name="lang" value="bn" />}

                    <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand-600 px-[1.125rem] text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-700 sm:rounded-full sm:px-7"
                    >
                        {copy.search}
                    </button>
                </form>
            </div>
        </section>
    );
}

/** Artwork, not an icon — hand-drawn SVG rather than a library import. */
function HeroArtwork() {
    return (
        <svg viewBox="0 0 420 300" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
            <defs>
                <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="100%" stopColor="#eff6ff" />
                </linearGradient>
                <linearGradient id="heroFade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#eff6ff" stopOpacity="1" />
                    <stop offset="35%" stopColor="#eff6ff" stopOpacity="0" />
                </linearGradient>
            </defs>

            <rect width="420" height="300" fill="url(#heroSky)" />
            <circle cx="322" cy="74" r="30" className="fill-amber-200/70" />
            <g className="fill-brand-200/65">
                <ellipse cx="110" cy="58" rx="34" ry="10" />
                <ellipse cx="252" cy="38" rx="26" ry="8" />
            </g>

            {/* Colonial-era facade, the visual shorthand for Shaheb Bazar */}
            <g className="fill-brand-300/55">
                <rect x="40" y="150" width="60" height="110" rx="3" />
                <rect x="330" y="162" width="62" height="98" rx="3" />
            </g>

            <g className="fill-brand-400/75">
                <rect x="150" y="120" width="130" height="140" rx="3" />
                <path d="M215 66c17 16 26 29 26 40h-52c0-11 9-24 26-40z" />
                <rect x="211" y="50" width="8" height="20" rx="4" />

                <rect x="118" y="104" width="26" height="156" rx="3" />
                <path d="M131 78c8 10 12 18 12 24h-24c0-6 4-14 12-24z" />
                <rect x="286" y="104" width="26" height="156" rx="3" />
                <path d="M299 78c8 10 12 18 12 24h-24c0-6 4-14 12-24z" />
            </g>

            {/* Arcade of arched windows */}
            <g className="fill-brand-50/90">
                {[0, 1, 2, 3, 4].map((i) => (
                    <rect key={i} x={164 + i * 23} y={158} width="14" height="34" rx="7" />
                ))}
                {[0, 1, 2, 3, 4].map((i) => (
                    <rect key={`b${i}`} x={164 + i * 23} y={206} width="14" height="30" rx="7" />
                ))}
            </g>

            <g className="fill-brand-500/30">
                <path d="M56 232c14-5 28-5 42 0v28H56z" />
                <path d="M344 240c12-4 24-4 36 0v20h-36z" />
            </g>

            <rect y="258" width="420" height="42" className="fill-brand-300/35" />
            <rect width="420" height="300" fill="url(#heroFade)" />
        </svg>
    );
}
