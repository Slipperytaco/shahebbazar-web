"use client";

import { useState } from "react";
import ListingForm from "../ListingForm";
import VendorListings from "../VendorListings";

// The add form and the listing list, with the list reloading after each save.
export function ListingsManager({ vendorId }: { vendorId: number }) {
    const [refresh, setRefresh] = useState(0);

    return (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <section
                id="add"
                aria-labelledby="add-heading"
                className="scroll-mt-24 self-start rounded-xl border border-line bg-surface p-5 shadow-card"
            >
                <h2 id="add-heading" className="mb-4 text-[1.0625rem] font-semibold tracking-tight">
                    Add a product or service
                </h2>
                {/* No cancel button: the add form is always shown. */}
                <ListingForm
                    vendorId={vendorId}
                    onSaved={() => setRefresh((n) => n + 1)}
                    onCancel={undefined}
                />
            </section>

            <section className="min-w-0 rounded-xl border border-line bg-surface p-5 shadow-card [&>div:first-child]:mt-0">
                <VendorListings vendorId={vendorId} refresh={refresh} />
            </section>
        </div>
    );
}
