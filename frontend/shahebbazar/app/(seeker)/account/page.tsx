import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My account",
};

/**
 * Placeholder route.
 *
 * No design has been approved for the customer account screens. This
 * documents the intended sections and the tables that support them.
 * Replace once designs are available.
 */

const SECTIONS = [
    {
        title: "Saved businesses",
        route: "/account/saved",
        table: "saved_businesses",
        note: "The bookmark on every business card writes here.",
    },
    {
        title: "My quote requests",
        route: "/account/quotes",
        table: "quote_requests, quote_responses",
        note: "Buyer side of the quotation flow.",
    },
    {
        title: "Messages",
        route: "/account/messages",
        table: "conversations, messages",
        note: "Buyer side of the buyer-to-seller messaging system.",
    },
    {
        title: "My reviews",
        route: "/account/reviews",
        table: "reviews",
        note: "One review per person per shop, enforced by a unique constraint.",
    },
    {
        title: "Settings",
        route: "/account/settings",
        table: "users",
        note: "Phone is the identifier; email is optional.",
    },
];

export default function AccountPage() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">My account</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
                Not built yet — there is no approved design for these screens. The
                sections below are what belongs here, and each already has its tables
                in the database.
            </p>

            <ul className="mt-8 space-y-3">
                {SECTIONS.map((section) => (
                    <li
                        key={section.route}
                        className="rounded-xl border border-line bg-surface p-4 shadow-card"
                    >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h2 className="text-[0.9375rem] font-semibold">{section.title}</h2>
                            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                                {section.route}
                            </code>
                        </div>
                        <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">
                            {section.note}
                        </p>
                        <p className="mt-1.5 text-xs text-soft">
                            Tables: <span className="font-mono">{section.table}</span>
                        </p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
