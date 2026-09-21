import { MapPin, Search } from "lucide-react";
import { HeroBackdrop } from "./HeroBackdrop";
import { t, type Locale } from "@/lib/i18n";

/**
 * Hero panel with the primary two-field search.
 *
 * Submits as a GET form, producing a linkable and crawlable
 * `/search?q=&where=` URL.
 */
export function Hero({ locale }: { locale: Locale }) {
    const copy = t(locale);

    return (
        <section className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            <HeroBackdrop />

            {/* Keeps the text legible over a changing backdrop: heaviest on the
                left where the heading sits, light on the right. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/45 md:to-surface/20"
            />

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
