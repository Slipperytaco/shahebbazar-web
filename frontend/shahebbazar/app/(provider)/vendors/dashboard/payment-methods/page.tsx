import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getVendorPaymentMethods } from "@/lib/api";
import { PaymentMethodsForm } from "./PaymentMethodsForm";

export const metadata: Metadata = {
    title: "Payment methods",
};

type Query = { vendor?: string };

export default async function PaymentMethodsPage({
    searchParams,
}: {
    searchParams: Promise<Query>;
}) {
    // TODO(auth): take the vendor from the signed-in user, not the query string.
    const { vendor } = await searchParams;
    const vendorId = /^\d+$/.test(vendor ?? "") ? Number(vendor) : null;

    if (vendorId === null) {
        return (
            <PageFrame>
                <p className="form-status-error">
                    No business selected. Choose one from the dashboard first.
                </p>
            </PageFrame>
        );
    }

    const data = await getVendorPaymentMethods(vendorId);
    if (!data) notFound();

    const { vendor: business, methods } = data;
    const isApproved = business.vendor_status === "approved";

    return (
        <PageFrame>
            <p className="-mt-3 mb-5 text-center text-sm text-muted">{business.vendor_name}</p>

            <p className="mb-5 text-sm leading-relaxed text-muted">
                Customers see these on your business profile, so they know how they can pay
                before they visit or order. Payment is made to you directly; Shahebbazar does not
                take or handle payments.
            </p>

            {!isApproved && (
                <p className="mb-5 rounded-lg bg-sponsor-bg p-3 text-sm text-sponsor-ink">
                    Your business is awaiting approval. Methods you save now appear on your
                    profile once it is approved.
                </p>
            )}

            <PaymentMethodsForm vendorId={business.vendor_id} initialMethods={methods} />

            {isApproved && (
                <Link
                    href={`/business/${business.vendor_slug}`}
                    className="form-button-secondary mt-3"
                >
                    View public profile
                </Link>
            )}
        </PageFrame>
    );
}

function PageFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-center px-4">
            <Link
                href="/vendors/dashboard"
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
            >
                <ChevronLeft className="size-4" />
                Back to dashboard
            </Link>

            <div className="form-card">
                <h1 className="form-title">Payment methods</h1>
                {children}
            </div>
        </div>
    );
}
