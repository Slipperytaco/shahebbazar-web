import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { apiGet, getVendorSummary } from "@/lib/api";
import { ProviderShell, parseVendorParam } from "@/components/provider/ProviderShell";
import type { OwnerDetails } from "@/lib/types";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
    title: "Settings",
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ vendor?: string }> }) {
    const vendorId = parseVendorParam((await searchParams).vendor);
    if (vendorId === null) redirect("/vendors/dashboard");
    const [vendor, owner] = await Promise.all([
        getVendorSummary(vendorId),
        apiGet<OwnerDetails>(`/vendors/${vendorId}/owner`),
    ]);
    if (!vendor || !owner) notFound();

    return (
        <ProviderShell vendor={vendor} current="settings">
            <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight">Settings</h1>
            <p className="mt-1.5 mb-5 text-[0.9375rem] text-muted">Your contact details as the business owner.</p>
            <SettingsForm vendorId={vendorId} owner={owner} />
        </ProviderShell>
    );
}
