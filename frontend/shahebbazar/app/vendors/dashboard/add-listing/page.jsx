"use client";
import { useState, useEffect } from "react";

export default function AddListing({ onListingCreated }) {
    const [vendors, setVendors] = useState([]);
    const [vendorId, setVendorId] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: ""    // becomes category_id 
    });

    const [categories, setCategories] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [status, setStatus] = useState(null);

    // Load vendors
    useEffect(() => {
        async function loadVendors() {
            const res = await fetch("http://localhost:4000/api/vendors");
            const data = await res.json();
            setVendors(data.vendors || []);
        }
        loadVendors();
    }, []);
    
    // Load global categories
    useEffect(() => {
        async function loadCats() {
            const res = await fetch("http://localhost:4000/api/categories");
            const data = await res.json();
            setCategories(data.categories || []);
        }
        loadCats();
    }, []);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.price || isNaN(form.price)) {
            setStatus({ type: "error", message: "Please enter a valid price." });
            return;
        }

        // 1. Create listing
        const listingRes = await fetch(
            `http://localhost:4000/api/vendors/${vendorId}/listings`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    price: Number(form.price),
                    category: form.category   
                })
            }
        );

        const listingData = await listingRes.json();
        console.log("Listing response:", listingData);
        const listingId = listingData.listing_id;

        // 2. Upload photos
        if (photos.length > 0) {
            const formData = new FormData();
            photos.forEach((file) => formData.append("photos", file));

            const photoRes = await fetch(
                `http://localhost:4000/api/listings/${listingId}/photos`,
                {
                    method: "POST",
                    body: formData
                }
            );
            const photoData = await photoRes.json();

            if (!photoRes.ok) {
                setStatus({ type: "error", message: photoData.error });
                return;
            }

        }
        //console.log("Vendor ID in AddListing:", vendorId);
        setStatus({ type: "success", message: "Listing created successfully!" });
        if (onListingCreated) {
            onListingCreated();
        }

    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {status && (
                <div className={status.type === "error" ? "form-status-error" : "form-status-success"}>
                    {status.message}
                </div>
            )}

            <select
                name="vendorId"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="form-input"
            >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                    <option key={v.vendor_id} value={v.vendor_id}>
                        {v.vendor_name}
                    </option>
                ))}
            </select>


            <input
                name="title"
                placeholder="Item Name"
                value={form.title}
                onChange={handleChange}
                className="form-input"
            />

            <input
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="form-input"
            />

            <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input"
            >
                <option value="">Select Category</option>
                {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                    </option>
                ))}
            </select>

            <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="form-input"
            />

            <input
                type="file"
                multiple
                onChange={handlePhotoUpload}
                className="form-input"
            />

            <button type="submit" className="form-button-primary">
                Publish Listing
            </button>
        </form>
    );
}
