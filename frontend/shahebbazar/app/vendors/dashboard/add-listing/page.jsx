"use client";
import { useState } from "react";

export default function AddListing({ vendorId, onListingCreated }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: ""
    });

    const [photos, setPhotos] = useState([]);
    const [status, setStatus] = useState(null);

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
                    ...form,
                    price: Number(form.price) // Ensure price is sent as a number
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

            <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                className="form-input"
            />

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
