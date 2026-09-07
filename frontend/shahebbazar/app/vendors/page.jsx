"use client";

import { useEffect, useState } from "react";

export default function VendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await fetch("http://localhost:4000/api/vendors");
            const data = await res.json();

            setVendors(data.vendors);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="page-center">
                <div className="form-card">Loading vendors...</div>
            </div>
        );
    }

    return (
        <div className="page-center">
            <div className="form-card">
                <h2 className="form-title">Vendors</h2>

                <div className="mt-4 flex flex-col gap-3">
                    {vendors.length === 0 && (
                        <p className="text-gray-400 text-sm">No vendors found.</p>
                    )}

                    {vendors.map((v) => (
                        <div key={v.vendor_id} className="border border-gray-700 rounded p-3">
                            <div className="font-semibold">{v.vendor_name}</div>
                            <div className="text-sm text-gray-400">{v.vendor_city}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
