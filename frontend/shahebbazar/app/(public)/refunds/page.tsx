import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/public/PolicyPage";
import { resolveLocale } from "@/lib/i18n";

export const metadata: Metadata = {
    title: "Refund Policy",
    description:
        "How payments and refunds work on Shahebbazar, and who to approach when something goes wrong.",
};

const SECTIONS: PolicySection[] = [
    {
        heading: "1. Shahebbazar does not process payments",
        body: [
            "At present Shahebbazar does not take payments and does not hold money on behalf of anyone. There is no checkout on this site.",
            "When you find a business here, you contact them directly and settle payment with them — in cash, on delivery, by bank transfer or by whichever method that business accepts. The accepted methods are shown on each business profile.",
        ],
    },
    {
        heading: "2. Who to approach about a refund",
        body: [
            "Because payment is made directly to the business, a refund is agreed directly with that business. Their own returns and refund terms apply, and they are the ones who can issue one.",
            "Shahebbazar is not a party to the transaction and cannot reverse a payment it never received.",
        ],
    },
    {
        heading: "3. What we can do",
        body: [
            "We do want to know when a business treats a customer badly. If a listing is misleading, a price shown here is not honoured, or a business behaves dishonestly, report it to us.",
            "We investigate reports and can require a listing to be corrected, suspend it, or remove the business from the directory. Repeated reports affect whether a business stays listed at all.",
        ],
    },
    {
        heading: "4. Paid services for businesses",
        body: [
            "Businesses may in future pay Shahebbazar for optional services such as promoted placement. Those are the only payments Shahebbazar itself receives.",
            "If a paid placement is not delivered — for example the promotion does not run for the period agreed — the business may request a refund of the unused portion within 30 days of the charge. Requests are handled through the contact page.",
        ],
    },
    {
        heading: "5. When online payment is introduced",
        body: [
            "Online payment through bKash, Nagad or a card gateway is planned for a later phase of this project. When it is introduced, this page will be replaced with terms covering how those payments are refunded, the timescales involved, and how disputes are handled.",
            "Until this page says otherwise, no online payment is accepted anywhere on this site. Anyone asking you to pay Shahebbazar online today is not acting for us.",
        ],
    },
    {
        heading: "6. Contact",
        body: [
            "Reports about a business, and refund requests for paid placement, can be sent through the contact page.",
        ],
    },
];

export default async function RefundsPage({
    searchParams,
}: {
    searchParams: Promise<{ lang?: string }>;
}) {
    const { lang } = await searchParams;

    return (
        <PolicyPage
            locale={resolveLocale(lang)}
            title="Refund Policy"
            updated="20 September 2026"
            intro="Shahebbazar is a directory, not a shop. This page explains what that means for payments and refunds, and what to do when something goes wrong."
            sections={SECTIONS}
        />
    );
}
