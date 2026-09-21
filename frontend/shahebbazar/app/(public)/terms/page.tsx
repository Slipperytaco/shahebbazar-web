import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/public/PolicyPage";
import { resolveLocale } from "@/lib/i18n";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "The terms that apply to using Shahebbazar, the local business directory for Rajshahi.",
};

const SECTIONS: PolicySection[] = [
    {
        heading: "1. What Shahebbazar is",
        body: [
            "Shahebbazar is a directory. It helps people in and around Rajshahi find local businesses, and helps those businesses be found. It lists shops, services and the products they offer.",
            "Shahebbazar is not a shop and not a payment processor. When you contact a business through this site, any agreement, payment and delivery is between you and that business directly. Shahebbazar is not a party to it and does not hold your money.",
        ],
    },
    {
        heading: "2. Using the site",
        body: [
            "Browsing the directory needs no account. An account is required to list a business, send an enquiry or leave a review.",
            "You agree not to:",
            [
                "list a business you are not authorised to represent",
                "post false, misleading or unlawful information",
                "write or solicit reviews that are not based on genuine experience",
                "collect other people's contact details from the site in bulk",
                "attempt to disrupt or gain unauthorised access to the service",
            ],
        ],
    },
    {
        heading: "3. Business listings",
        body: [
            "A business owner is responsible for the accuracy of their own listing, including prices, opening hours, contact details and the products or services shown.",
            "Prices shown are indicative. Where a listing shows a range or says price on request, the final price is agreed directly with the business.",
            "Listings are reviewed before they appear publicly. We may decline, edit or remove a listing that breaks these terms, and we may remove a business that repeatedly does so.",
        ],
    },
    {
        heading: "4. Reviews",
        body: [
            "Reviews must describe your own genuine experience. We remove reviews that are abusive, defamatory, off-topic, or written in exchange for payment, and we may remove a review while we investigate a report about it.",
        ],
    },
    {
        heading: "5. Paid placement",
        body: [
            "Some results are promoted. Promoted results are always labelled as such and are never presented as ordinary search results. Paying for placement does not change a business's rating or its reviews.",
        ],
    },
    {
        heading: "6. Content you provide",
        body: [
            "You keep ownership of the text and images you upload. By uploading them you give Shahebbazar permission to display, resize and distribute them for the purpose of operating and promoting the directory.",
            "Do not upload anything you do not have the right to use, including photographs taken by someone else.",
        ],
    },
    {
        heading: "7. Availability and liability",
        body: [
            "The service is provided as it is. We work to keep the directory accurate and available, but we do not guarantee that a listing is correct, that a business will trade fairly, or that the site will be uninterrupted.",
            "To the extent the law allows, Shahebbazar is not liable for any loss arising from a transaction you enter into with a business you found here.",
        ],
    },
    {
        heading: "8. Changes and governing law",
        body: [
            "We may update these terms. Material changes will be noted on this page with a new date, and continuing to use the site means you accept the updated terms.",
            "These terms are governed by the laws of Bangladesh.",
        ],
    },
    {
        heading: "9. Contact",
        body: [
            "Questions about these terms, or a report about a listing or review, can be sent through the contact page.",
        ],
    },
];

export default async function TermsPage({
    searchParams,
}: {
    searchParams: Promise<{ lang?: string }>;
}) {
    const { lang } = await searchParams;

    return (
        <PolicyPage
            locale={resolveLocale(lang)}
            title="Terms of Service"
            updated="20 September 2026"
            intro="These terms apply to everyone who uses Shahebbazar, whether you are looking for a business or listing one. Please read them before using the site."
            sections={SECTIONS}
        />
    );
}
