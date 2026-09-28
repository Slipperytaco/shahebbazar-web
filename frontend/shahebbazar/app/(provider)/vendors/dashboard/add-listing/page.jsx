"use client";
import ListingForm from "../ListingForm";

// The form lives in ListingForm, shared with the inline editor.
export default function AddListing({ vendorId, onListingCreated }) {
    return <ListingForm vendorId={vendorId} onSaved={onListingCreated} />;
}
