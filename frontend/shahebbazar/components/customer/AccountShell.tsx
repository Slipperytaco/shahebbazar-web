import Link from "next/link";
import { AppShell } from "@/components/public/AppShell";

const TABS = [
    { key: "overview", label: "Overview", href: "/account" },
    { key: "saved", label: "Saved businesses", href: "/account/saved" },
    { key: "messages", label: "Messages", href: "/account/messages" },
    { key: "reviews", label: "My reviews", href: "/account/reviews" },
];

export function AccountShell({
    current,
    title,
    children,
}: {
    current: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <AppShell locale="en" current="/account">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <nav aria-label="Account" className="mt-4 flex gap-1 overflow-x-auto border-b border-line">
                {TABS.map((tab) => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        aria-current={tab.key === current ? "page" : undefined}
                        className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium ${
                            tab.key === current
                                ? "border-brand-600 text-brand-600"
                                : "border-transparent text-muted hover:text-ink"
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-5">{children}</div>
        </AppShell>
    );
}
