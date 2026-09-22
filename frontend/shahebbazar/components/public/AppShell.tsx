import { SiteHeader } from "../shared/SiteHeader";
import { SideNav } from "./SideNav";
import { SiteFooter } from "../shared/SiteFooter";
import type { Locale } from "@/lib/i18n";

/**
 * Page chrome: header, navigation rail, content column and footer.
 *
 * Implemented as a component rather than a layout because the locale is
 * read from a search parameter, which Next.js does not pass to layouts.
 * Each page resolves the locale and supplies it here.
 */
export function AppShell({
    locale,
    current,
    children,
}: {
    locale: Locale;
    current?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale} />

            {/* Declared here rather than on <html>, which the layout
                renders without access to the query string. */}
            <div
                lang={locale}
                className={`mx-auto flex w-full max-w-[1440px] flex-1 gap-5 px-4 py-5 sm:px-6 ${
                    locale === "bn" ? "font-bn" : ""
                }`}
            >
                <SideNav locale={locale} current={current} />
                <main className="min-w-0 flex-1">{children}</main>
            </div>

            <SiteFooter locale={locale} />
        </div>
    );
}
