import { SiteHeader } from "../shared/SiteHeader";
import { SideNav } from "./SideNav";
import { SiteFooter } from "../shared/SiteFooter";
import type { Locale } from "@/lib/i18n";

/**
 * Page chrome: header, left rail, content column, footer.
 *
 * This lives in a component rather than in `app/layout.tsx` because the
 * language comes from `?lang=`, and a Next layout is not given
 * `searchParams`. Each page resolves the locale and passes it down.
 *
 * When the locale moves into the route (`/bn/...`), this collapses back
 * into the layout and the prop goes away.
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

            {/*
              `lang` is set here rather than on <html> because the layout
              cannot see the query string. Assistive technology still gets
              the correct language for the content, which is what matters;
              locale-prefixed routes will move it up to <html>.
            */}
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
