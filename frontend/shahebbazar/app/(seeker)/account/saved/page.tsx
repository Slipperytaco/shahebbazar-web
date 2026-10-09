import type { Metadata } from "next";
import Link from "next/link";
import { AccountShell } from "@/components/customer/AccountShell";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { authenticatedApiGet } from "@/lib/auth-server";
import type { SavedBusiness } from "@/lib/types";

export const metadata: Metadata = {
    title: "Saved businesses",
};

export default async function SavedPage() {
    const saved =
        (await authenticatedApiGet<SavedBusiness[]>(
            "/me/saved"
        )) ?? [];
    return (
        <AccountShell current="saved" title="Saved businesses">
            {saved.length === 0 ? (
                <p className="text-sm text-muted">
                    Nothing saved yet. Tap the bookmark on any business to keep it here.{" "}
                    <Link href="/search" className="font-medium text-brand-600 hover:underline">
                        Find businesses
                    </Link>
                </p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {saved.map((business) => (
                        <li key={business.vendor_id}>
                            <BusinessCard locale="en" business={business} />
                        </li>
                    ))}
                </ul>
            )}
        </AccountShell>
    );
}
