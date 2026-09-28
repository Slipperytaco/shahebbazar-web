import Link from "next/link";
import {
    BadgePercent,
    CalendarDays,
    ChartLine,
    House,
    MapPin,
    MessageSquareText,
    MessagesSquare,
    Package,
    Settings,
    Star,
    Store,
    Wallet,
    type LucideIcon,
} from "lucide-react";

// Page frame for the provider area: header, navigation rail and content.

export type ProviderNavKey =
    | "dashboard"
    | "business"
    | "listings"
    | "payments"
    | "inquiries"
    | "reviews"
    | "messages"
    | "settings";

type NavItem = {
    key: string;
    label: string;
    Icon: LucideIcon;
} & (
    | { path: string; hash?: string }
    // Not built yet. "Soon" is planned for this phase; "Later" was moved
    // to Phase 2 by the client.
    | { path?: undefined; availability: "Soon" | "Later" }
);

const NAV: NavItem[] = [
    { key: "dashboard", label: "Dashboard", Icon: House, path: "/vendors/dashboard" },
    { key: "business", label: "My Business", Icon: Store, path: "/vendors/dashboard/business" },
    { key: "listings", label: "Products & Services", Icon: Package, path: "/vendors/dashboard/listings" },
    { key: "payments", label: "Payment Methods", Icon: Wallet, path: "/vendors/dashboard/payment-methods" },
    { key: "analytics", label: "Analytics", Icon: ChartLine, path: "/vendors/dashboard", hash: "analytics" },
    { key: "inquiries", label: "Inquiries", Icon: MessageSquareText, path: "/vendors/dashboard/inquiries" },
    { key: "reviews", label: "Reviews", Icon: Star, path: "/vendors/dashboard/reviews" },
    { key: "messages", label: "Messages", Icon: MessagesSquare, path: "/vendors/dashboard/messages" },
    { key: "bookings", label: "Bookings", Icon: CalendarDays, availability: "Later" },
    { key: "promotions", label: "Promotions", Icon: BadgePercent, availability: "Later" },
    { key: "settings", label: "Settings", Icon: Settings, path: "/vendors/dashboard/settings" },
];

// Reads the development `?vendor=<id>` parameter.
export function parseVendorParam(raw: string | string[] | undefined): number | null {
    if (typeof raw !== "string" || !/^\d{1,10}$/.test(raw)) return null;
    const id = Number(raw);
    return id > 0 && id <= 2147483647 ? id : null;
}

/** Appends the development `vendor` parameter to a provider path. */
export function providerHref(path: string, vendorId: number, hash?: string): string {
    return `${path}?vendor=${vendorId}${hash ? `#${hash}` : ""}`;
}

/** "SB-000042": the id the design shows in the header, zero-padded. */
export function businessCode(vendorId: number): string {
    return `SB-${String(vendorId).padStart(6, "0")}`;
}

export function ProviderShell({
    vendor,
    current,
    children,
}: {
    vendor: { vendor_id: number; vendor_name: string };
    current: ProviderNavKey;
    children: React.ReactNode;
}) {
    const initial = vendor.vendor_name.trim().charAt(0).toUpperCase() || "?";

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-line bg-surface">
                <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
                    <Link href="/" className="flex shrink-0 items-center gap-2">
                        <MapPin className="size-6 fill-brand-600 text-brand-600" strokeWidth={1.5} />
                        <span className="text-[1.35rem] font-bold tracking-tight text-brand-600">
                            Shahebbazar
                        </span>
                    </Link>

                    <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
                        <Link
                            href="/vendors/dashboard"
                            className="hidden text-[0.8125rem] font-medium text-muted hover:text-ink sm:block"
                            title="Development only: pick another business. Removed when sign-in exists."
                        >
                            Switch business
                        </Link>

                        <div className="flex min-w-0 items-center gap-2.5">
                            <span
                                aria-hidden
                                className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
                            >
                                {initial}
                            </span>
                            <div className="min-w-0 leading-tight">
                                <p className="truncate text-sm font-semibold">{vendor.vendor_name}</p>
                                <p className="text-[0.75rem] text-muted">Business Owner</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile: the enabled destinations as a scrolling row. */}
            <nav
                aria-label="Provider"
                className="border-b border-line bg-surface lg:hidden"
            >
                <ul className="flex gap-1 overflow-x-auto px-4 py-2">
                    {NAV.filter((item) => item.path && !("hash" in item && item.hash)).map((item) => (
                        <li key={item.key} className="shrink-0">
                            <Link
                                href={providerHref(item.path!, vendor.vendor_id)}
                                aria-current={item.key === current ? "page" : undefined}
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium ${
                                    item.key === current
                                        ? "bg-brand-50 text-brand-600"
                                        : "text-muted hover:text-ink"
                                }`}
                            >
                                <item.Icon className="size-4" strokeWidth={1.75} />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 py-6 sm:px-6">
                <aside className="hidden w-[236px] shrink-0 lg:block">
                    <nav
                        aria-label="Provider"
                        className="rounded-xl border border-line bg-surface p-2 shadow-card"
                    >
                        <ul className="space-y-0.5">
                            {NAV.map((item) => (
                                <li key={item.key}>
                                    <NavRow item={item} vendorId={vendor.vendor_id} active={item.key === current} />
                                </li>
                            ))}
                        </ul>
                    </nav>

                </aside>

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}

function NavRow({ item, vendorId, active }: { item: NavItem; vendorId: number; active: boolean }) {
    const { Icon, label } = item;
    const row = "flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm";

    if (item.path === undefined) {
        return (
            <span aria-disabled="true" className={`${row} cursor-default font-medium text-soft`}>
                <Icon className="size-[19px]" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.6875rem] font-medium text-muted">
                    {item.availability}
                </span>
            </span>
        );
    }

    return (
        <Link
            href={providerHref(item.path, vendorId, item.hash)}
            aria-current={active ? "page" : undefined}
            className={`${row} transition-colors ${
                active
                    ? "bg-brand-50 font-semibold text-brand-600"
                    : "font-medium text-muted hover:bg-surface-2 hover:text-ink"
            }`}
        >
            <Icon className="size-[19px]" strokeWidth={1.75} />
            <span>{label}</span>
        </Link>
    );
}
