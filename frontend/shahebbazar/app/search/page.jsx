"use client";

import { useState } from "react";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();

        const res = await fetch(
            `http://localhost:4000/api/vendors/search?q=${encodeURIComponent(query)}`
        );

        const data = await res.json();
        setResults(data.vendors);
    };

    return (
        <div className="page-center">
            <div className="form-card">
                <h2 className="form-title">Search Vendors</h2>

                <form onSubmit={handleSearch} className="flex flex-col gap-3 mt-4">
                    <input
                        className="form-input"
                        placeholder="Search by name or city"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <button type="submit" className="form-button-primary">
                        Search
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-3">
                    {results.map((v) => (
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
