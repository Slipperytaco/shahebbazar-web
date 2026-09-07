"use client";
import { useEffect, useState } from "react";

export default function VendorListings({ vendorId, refresh }) {
    const [listings, setListings] = useState([]);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        async function loadListings() {
            const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}/listings`);
            const data = await res.json();
            setListings(data);
        }
        loadListings();
    }, [vendorId, refresh]);

    if (listings.length === 0) {
        return (
            <div className="mt-10 text-gray-400">
                No listings yet.
            </div>
        );
    }
    async function deleteListing(id) {
        const res = await fetch(`http://localhost:4000/api/listings/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
            setStatus({ type: "error", message: data.error });
            return;
        }

        // Refresh listings
        setListings(listings.filter((l) => l.listing_id !== id));
    }


    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold mb-3">Your Listings</h3>
            {status && (
                <div className={status.type === "error" ? "form-status-error" : "form-status-success"}>
                    {status.message}
                </div>
            )}
            <div className="flex flex-col gap-4">
                {listings.map((listing) => (
                    <div
                        key={listing.listing_id}
                        className="p-4 bg-neutral-900 border border-neutral-700 rounded-md"
                    >
                        <h4 className="text-md font-semibold">{listing.title}</h4>
                        <p className="text-gray-400">${listing.price}</p>
                        <p className="text-gray-400">{listing.category}</p>

                        <div className="flex gap-3 mt-3">
                            <a
                                href={`/vendors/listings/${listing.listing_id}`}
                                className="form-button-primary text-center"
                            >
                                View
                            </a>

                            <a
                                href={`/vendors/listings/${listing.listing_id}/edit`}
                                className="form-button-secondary text-center"
                            >
                                Edit
                            </a>

                            <button
                                className="form-button-danger"
                                onClick={() => deleteListing(listing.listing_id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
