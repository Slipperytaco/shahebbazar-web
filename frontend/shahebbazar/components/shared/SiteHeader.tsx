import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { t, localeHref, type Locale } from "@/lib/i18n";

/**
 * Site header: brand, global search, language toggle and account actions.
 *
 * Search submits as a standard GET form, producing a linkable and
 * crawlable `/search?q=` URL and functioning without JavaScript.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
    const copy = t(locale);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
                <Link href={localeHref("/", locale)} className="flex shrink-0 items-center gap-2">
                    <MapPin className="size-6 fill-brand-600 text-brand-600" strokeWidth={1.5} />
                    <span className="text-[1.35rem] font-bold tracking-tight text-brand-600">
                        {copy.brand}
                    </span>
                </Link>

                {/* Hidden on small viewports; the hero provides an
                    equivalent search field. */}
                <form
                    action="/search"
                    method="get"
                    role="search"
                    className="relative hidden flex-1 md:block"
                >
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-soft" />
                    <label htmlFor="site-search" className="sr-only">
                        {copy.searchPlaceholder}
                    </label>
                    <input
                        id="site-search"
                        name="q"
                        type="search"
                        placeholder={copy.searchPlaceholder}
                        className="h-11 w-full rounded-full border border-line-strong bg-surface pr-14 pl-11 text-sm text-ink outline-none transition placeholder:text-soft focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
                    />
                    {locale === "bn" && <input type="hidden" name="lang" value="bn" />}
                    <button
                        type="submit"
                        aria-label={copy.search}
                        className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
                    >
                        <Search className="size-4" />
                    </button>
                </form>

                <div className="ml-auto flex items-center gap-3 sm:gap-4">
                    <nav
                        aria-label="Language"
                        className="hidden items-center gap-2 text-[0.8125rem] sm:flex"
                    >
                        <Link
                            href={localeHref("/", "en")}
                            aria-current={locale === "en" ? "true" : undefined}
                            className={
                                locale === "en"
                                    ? "font-semibold text-brand-600"
                                    : "text-muted hover:text-ink"
                            }
                        >
                            English
                        </Link>
                        <span aria-hidden className="text-line-strong">
                            |
                        </span>
                        <Link
                            href={localeHref("/", "bn")}
                            lang="bn"
                            aria-current={locale === "bn" ? "true" : undefined}
                            className={
                                locale === "bn"
                                    ? "font-bn font-semibold text-brand-600"
                                    : "font-bn text-muted hover:text-ink"
                            }
                        >
                            বাংলা
                        </Link>
                    </nav>

                    <Link
                        href={localeHref("/login", locale)}
                        className="hidden text-sm font-medium text-muted hover:text-ink sm:block"
                    >
                        {copy.logIn}
                    </Link>
                    <Link
                        href={localeHref("/vendors/register", locale)}
                        className="inline-flex items-center justify-center rounded-[10px] bg-brand-600 px-[1.125rem] py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-700"
                    >
                        {copy.register}
                    </Link>
                </div>
            </div>
        </header>
    );
}
