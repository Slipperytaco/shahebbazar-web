import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { SiFacebook, SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import { t, localeHref, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
    const copy = t(locale);
    const year = new Date().getFullYear();

    const columns = [
        {
            title: copy.footerAbout,
            links: [
                { label: copy.footerAboutUs, href: "/about" },
                { label: copy.footerHowItWorks, href: "/how-it-works" },
                { label: copy.navBlog, href: "/blog" },
                { label: copy.footerContact, href: "/contact" },
            ],
        },
        {
            title: copy.footerForBusinesses,
            links: [
                { label: copy.footerAddBusiness, href: "/vendors/register" },
                { label: copy.footerDashboard, href: "/vendors/dashboard" },
                { label: copy.footerPlans, href: "/pricing" },
                { label: copy.footerSupport, href: "/support" },
            ],
        },
        {
            title: copy.footerHelp,
            links: [
                { label: copy.footerTerms, href: "/terms" },
                { label: copy.footerPrivacy, href: "/privacy" },
                { label: copy.footerRefunds, href: "/refunds" },
                { label: copy.footerCookies, href: "/cookies" },
                { label: copy.footerFaq, href: "/faq" },
            ],
        },
    ];

    // Brand marks are provided by Simple Icons; lucide excludes logos.
    const socials = [
        { Icon: SiFacebook, label: "Facebook" },
        { Icon: SiInstagram, label: "Instagram" },
        { Icon: SiYoutube, label: "YouTube" },
    ];

    return (
        <footer className="mt-10 border-t border-line bg-surface">
            <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.6fr]">
                    <div>
                        <div className="flex items-center gap-2">
                            <MapPin
                                className="size-[22px] fill-brand-600 text-brand-600"
                                strokeWidth={1.5}
                            />
                            <span className="text-lg font-bold text-brand-600">{copy.brand}</span>
                        </div>
                        <p className="mt-3 max-w-xs text-[0.8125rem] leading-relaxed text-muted">
                            {copy.footerTagline}
                        </p>
                        <div className="mt-4 flex gap-2.5">
                            {socials.map(({ Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="grid size-8 place-items-center rounded-full bg-brand-600 text-white transition-opacity hover:opacity-85"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-[0.9375rem] font-semibold">{column.title}</h3>
                            <ul className="mt-3.5 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={localeHref(link.href, locale)}
                                            className="text-[0.8125rem] text-muted hover:text-brand-600"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div>
                        <h3 className="text-[0.9375rem] font-semibold">
                            {copy.footerStayConnected}
                        </h3>
                        <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
                            {copy.footerNewsletter}
                        </p>
                        {/* Target route is not yet implemented; the form
                            fails visibly rather than appearing to succeed. */}
                        <form action="/api/subscribe" method="post" className="mt-4 flex gap-2">
                            <label htmlFor="newsletter-email" className="sr-only">
                                {copy.footerEmailPlaceholder}
                            </label>
                            <input
                                id="newsletter-email"
                                name="email"
                                type="email"
                                required
                                placeholder={copy.footerEmailPlaceholder}
                                className="h-10 w-full rounded-[10px] border border-line-strong bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-soft focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
                            />
                            <button
                                type="submit"
                                className="shrink-0 rounded-[10px] bg-brand-600 px-[1.125rem] py-2.5 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-brand-700"
                            >
                                {copy.subscribe}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="border-t border-line">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-[0.8125rem] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>
                        © {year} {copy.brand}. {copy.footerRights}
                    </p>
                    <p className="flex items-center gap-1.5">
                        {copy.madeWith}
                        <Heart className="size-3.5 fill-rose-600 text-rose-600" />
                        {copy.forRajshahi}
                    </p>
                </div>
            </div>
        </footer>
    );
}
