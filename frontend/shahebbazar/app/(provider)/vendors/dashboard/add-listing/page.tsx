import { redirect } from "next/navigation";
import { parseVendorParam, providerHref } from "@/components/provider/ProviderShell";

// Old address of the add-listing form.
export default async function AddListingRedirect({
    searchParams,
}: {
    searchParams: Promise<{ vendor?: string }>;
}) {
    const vendorId = parseVendorParam((await searchParams).vendor);
    redirect(
        vendorId === null
            ? "/vendors/dashboard"
            : providerHref("/vendors/dashboard/listings", vendorId, "add")
    );
}
