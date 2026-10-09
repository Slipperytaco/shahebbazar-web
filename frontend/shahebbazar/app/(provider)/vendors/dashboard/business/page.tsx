import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { authenticatedApiGet } from "@/lib/auth-server";
import type {
    VendorProfileWithOptions,
} from "@/lib/types";
import { ProviderShell, parseVendorParam } from "@/components/provider/ProviderShell";
import { BusinessForm } from "./BusinessForm";

export const metadata: Metadata = {
    title: "Edit business",
};

export default async function EditBusinessPage({
    searchParams,
}: {
    searchParams: Promise<{ vendor?: string }>;
}) {
    // Ownership is verified by the protected backend profile route.
    const vendorId = parseVendorParam((await searchParams).vendor);
    if (vendorId === null) redirect("/vendors/dashboard");

    const profile =
        await authenticatedApiGet<VendorProfileWithOptions>(`/vendors/${vendorId}/profile`);

    if (!profile) notFound();

    return (
        <ProviderShell vendor={profile.vendor} current="business">
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">Edit Business</h1>
            <p className="mt-1.5 mb-6 text-[0.9375rem] text-muted">
                Fill in the details below so customers can find and trust your business.
            </p>
            <BusinessForm initial={profile} />
        </ProviderShell>
    );
}
