"use client";
import { useEffect, useState } from "react";
import AddListing from "./add-listing/page";
import VendorListings from "./VendorListings";


export default function VendorDashboard() {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [refreshListings, setRefreshListings] = useState(0);


    useEffect(() => {
        async function loadVendors() {
            const res = await fetch("http://localhost:4000/api/vendors");
            const data = await res.json();
            setVendors(data);

            // Auto-select the first vendor for now
            if (data.length > 0) {
                setSelectedVendor(data[0]);
            }
        }
        loadVendors();
    }, []);

    return (
        <div className="page-center">
            <div className="form-card">
                <h2 className="form-title">Vendor Dashboard</h2>

                {/* Vendor Selector */}
                <div className="mt-4">
                    <label className="text-gray-300 text-sm">Select Vendor</label>
                    <select
                        className="form-input mt-2"
                        value={selectedVendor?.vendor_id || ""}
                        onChange={(e) => {
                            const vendor = vendors.find(
                                (v) => v.vendor_id === Number(e.target.value)
                            );
                            setSelectedVendor(vendor);
                        }}
                    >
                        {vendors.map((v) => (
                            <option key={v.vendor_id} value={v.vendor_id}>
                                {v.vendor_name || "Unnamed Vendor"}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Vendor Details */}
                {selectedVendor && (
                    <div className="mt-6 p-4 rounded-md bg-neutral-900 border border-neutral-700">
                        <h3 className="text-lg font-semibold mb-3">
                            {selectedVendor.vendor_name}
                        </h3>

                        <p><strong>Email:</strong> {selectedVendor.vendor_email}</p>
                        <p><strong>Phone:</strong> {selectedVendor.vendor_phone}</p>
                        <p><strong>Address:</strong> {selectedVendor.vendor_address}</p>
                        <p><strong>City:</strong> {selectedVendor.vendor_city}</p>

                        <p className="text-gray-400 text-sm mt-3">
                            Joined: {new Date(selectedVendor.vendor_created_at).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Dashboard Actions */}
                <div className="flex flex-col gap-3 mt-6">
                    <a
                        href="/vendors/register"
                        className="form-button-primary text-center"
                    >
                        Register New Vendor
                    </a>

                    <a
                        href="/vendors"
                        className="form-button-primary text-center"
                    >
                        View All Vendors
                    </a>

                    <a
                        href="/search"
                        className="form-button-primary text-center"
                    >
                        Search Vendors
                    </a>
                </div>
                {/* Add Listing Form */}

                {selectedVendor && (
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold mb-3">Add Listing</h3>
                        <AddListing
                            vendorId={selectedVendor.vendor_id}
                            onListingCreated={() => setRefreshListings(refreshListings + 1)}
                        />
                    </div>
                )}

                {selectedVendor && (
                    <VendorListings
                        vendorId={selectedVendor.vendor_id}
                        refresh={refreshListings}
                    />
                )}


            </div>
        </div>
    );
}
