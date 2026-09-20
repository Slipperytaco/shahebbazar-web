"use client";
import { useEffect, useState } from "react";
import AddListing from "./add-listing/page";
import VendorListings from "./VendorListings";

export default function VendorDashboard() {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [refreshListings, setRefreshListings] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        async function loadVendors() {
            const res = await fetch("http://localhost:4000/api/vendors");
            const data = await res.json();
            setVendors(data.vendors);

            if (data.vendors.length > 0) {
                setSelectedVendor(data.vendors[0]);
            }
        }
        loadVendors();
    }, []);

    return (


            <div className="dashboard-container">

                {/* Title */}
                <div className="dashboard-title">
                    <h2 className="form-title">Vendor Dashboard</h2>
                </div>

                {/* Main layout */}
                <div className="dashboard-layout">

                    {/* LEFT: Vendor panel */}
                    <div className="vendor-column">
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

                        {selectedVendor && (
                            <div className="vendor-card">
                                <h3 className="text-lg font-semibold mb-3">
                                    {selectedVendor.vendor_name}
                                </h3>

                                <p className="text-gray-400 text-sm">
                                    Email: {selectedVendor.vendor_email}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Phone: {selectedVendor.vendor_phone}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {selectedVendor.vendor_address}, {selectedVendor.vendor_city}
                                </p>

                                <p className="text-gray-500 text-xs mt-3">
                                    Joined: {new Date(selectedVendor.vendor_created_at).toLocaleDateString()}
                                </p>

                                <div className="vendor-actions">
                                    <a href="/vendors/register" className="form-button-primary text-center">
                                        Register New Vendor
                                    </a>
                                    <a href="/vendors" className="form-button-primary text-center">
                                        View All Vendors
                                    </a>
                                    <a href="/search" className="form-button-primary text-center">
                                        Business Search
                                    </a>
                                    <a href="/vendors/dashboard/inquiries" className="form-button-primary text-center">
                                        View Inquiries
                                    </a>
                                    <a href="/vendors/dashboard/profile" className="form-button-primary text-center">
                                        Edit Business Profile
                                    </a>
                                    <button
                                        className="form-button-primary text-center"
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        Add Listing
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Listings + placeholders */}
                    <div className="flex-1">
                        {selectedVendor && (
                            <VendorListings
                                vendorId={selectedVendor.vendor_id}
                                refresh={refreshListings}
                            />
                        )}

                        <div className="placeholder-grid">
                            <div className="placeholder-card">
                                <h3 className="text-lg font-semibold mb-2">Search Listings</h3>
                                <p className="text-gray-400 text-sm">
                                    Advanced search and filters (MOQ, lead time, cost per unit) will be added here.
                                </p>
                            </div>

                            <div className="placeholder-card">
                                <h3 className="text-lg font-semibold mb-2">Analytics Overview</h3>
                                <p className="text-gray-400 text-sm">
                                    Daily users, search trends, and item analytics will be displayed here.
                                </p>
                            </div>

                            <div className="placeholder-card">
                                <h3 className="text-lg font-semibold mb-2">Marketing & Sponsorship</h3>
                                <p className="text-gray-400 text-sm">
                                    Sponsored listings and Facebook ad integrations will be managed from this section.
                                </p>
                            </div>

                            <div className="placeholder-card">
                                <h3 className="text-lg font-semibold mb-2">Lead Routing</h3>
                                <p className="text-gray-400 text-sm">
                                    Smart lead routing and matching logic will be configured here in Phase 2.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Listing Modal */}
                {showAddModal && selectedVendor && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Add Listing</h3>
                                <button
                                    className="text-gray-400 hover:text-gray-200"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <AddListing
                                vendorId={selectedVendor.vendor_id}
                                onListingCreated={() => {
                                    setShowAddModal(false);
                                    setRefreshListings((r) => r + 1);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        
    );
}
