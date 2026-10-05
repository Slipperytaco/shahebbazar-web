import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { t, localeHref, type Locale } from "@/lib/i18n";
import { MainNavList } from "../public/SideNav";
import { MobileMenu } from "./MobileMenu";

// Site header: brand, global search, language toggle and account actions.
export function SiteHeader({ locale, current }: { locale: Locale; current?: string }) {
    const copy = t(locale);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
                <Link href={localeHref("/", locale)} className="flex shrink-0 items-center gap-2">
                    <MapPin className="size-6 fill-brand-600 text-brand-600" strokeWidth={1.5} />
                    <span className="text-xl font-bold tracking-tight text-brand-600 sm:text-[1.35rem]">
                        {copy.brand}
                    </span>
                </Link>

                {/* Hidden on small viewports; the hero provides an equivalent search field. */}
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
                        className="hidden items-center gap-2 text-[0.8125rem] lg:flex"
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
                        href="/account"
                        className="hidden text-sm font-medium text-muted hover:text-ink lg:block"
                    >
                        {copy.myAccount}
                    </Link>
                    <Link
                        href={localeHref("/login", locale)}
                        className="hidden text-sm font-medium text-muted hover:text-ink lg:block"
                    >
                        {copy.logIn}
                    </Link>
                    <Link
                        href={localeHref("/vendors/register", locale)}
                        className="inline-flex items-center justify-center rounded-[10px] bg-brand-600 px-3 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-700 max-[359px]:hidden sm:px-[1.125rem]"
                    >
                        {copy.register}
                    </Link>

                    <MobileMenu>
                        <form action="/search" method="get" role="search" className="relative md:hidden">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-soft" />
                            <input
                                name="q"
                                type="search"
                                aria-label={copy.search}
                                placeholder={copy.searchPlaceholder}
                                className="h-11 w-full rounded-full border border-line-strong bg-surface pr-4 pl-11 text-sm text-ink outline-none placeholder:text-soft focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
                            />
                            {locale === "bn" && <input type="hidden" name="lang" value="bn" />}
                        </form>

                        <nav aria-label="Main" className="mt-3">
                            <MainNavList locale={locale} current={current} />
                        </nav>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm font-medium">
                            <Link href="/account" className="rounded-[10px] px-3.5 py-2.5 text-muted hover:bg-surface-2 hover:text-ink">
                                {copy.myAccount}
                            </Link>
                            <Link href={localeHref("/login", locale)} className="rounded-[10px] px-3.5 py-2.5 text-muted hover:bg-surface-2 hover:text-ink">
                                {copy.logIn}
                            </Link>
                            <Link
                                href={localeHref("/", "en")}
                                aria-current={locale === "en" ? "true" : undefined}
                                className={`rounded-[10px] px-3.5 py-2.5 ${locale === "en" ? "bg-brand-50 text-brand-600" : "text-muted hover:bg-surface-2"}`}
                            >
                                English
                            </Link>
                            <Link
                                href={localeHref("/", "bn")}
                                lang="bn"
                                aria-current={locale === "bn" ? "true" : undefined}
                                className={`font-bn rounded-[10px] px-3.5 py-2.5 ${locale === "bn" ? "bg-brand-50 text-brand-600" : "text-muted hover:bg-surface-2"}`}
                            >
                                বাংলা
                            </Link>
                        </div>
                    </MobileMenu>
                </div>
            </div>
        </header>
    );
}
