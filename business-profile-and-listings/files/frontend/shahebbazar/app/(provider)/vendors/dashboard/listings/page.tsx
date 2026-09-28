import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getVendorSummary } from "@/lib/api";
import { ProviderShell, parseVendorParam } from "@/components/provider/ProviderShell";
import { ListingsManager } from "./ListingsManager";

export const metadata: Metadata = {
    title: "Products & services",
};

// Add, edit and delete listings.
export default async function ListingsPage({
    searchParams,
}: {
    searchParams: Promise<{ vendor?: string }>;
}) {
    // TODO(auth): take the business from the signed-in owner.
    const vendorId = parseVendorParam((await searchParams).vendor);
    if (vendorId === null) redirect("/vendors/dashboard");

    const vendor = await getVendorSummary(vendorId);
    if (!vendor) notFound();

    return (
        <ProviderShell vendor={vendor} current="listings">
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">
                Products &amp; Services
            </h1>
            <p className="mt-1.5 text-[0.9375rem] text-muted">
                What you sell or offer. New listings are checked by an administrator before
                they appear on your public page.
            </p>

            <ListingsManager vendorId={vendor.vendor_id} />
        </ProviderShell>
    );
}
