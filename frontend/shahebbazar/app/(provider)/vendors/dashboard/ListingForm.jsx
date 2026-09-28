"use client";
import { useEffect, useState } from "react";
import { BROWSER_API_BASE } from "@/lib/apiBase";

// Shared by the add-listing page and the inline editor, so the two cannot
// drift apart. Field names match schema v2 — the earlier form posted title,
// price and a free-text category, none of which are columns any more.

const EMPTY = {
    listing_title: "",
    listing_title_bn: "",
    listing_description: "",
    category_id: "",
    listing_price: "",
    listing_price_max: "",
    listing_price_unit: "",
    listing_min_order_qty: "",
};

export default function ListingForm({
    vendorId,
    listing = null,
    onSaved,
    onCancel,
}) {
    const editing = Boolean(listing);

    const [form, setForm] = useState(() =>
        listing
            ? {
                listing_title: listing.listing_title ?? "",
                listing_title_bn: listing.listing_title_bn ?? "",
                listing_description: listing.listing_description ?? "",
                category_id: listing.category_id ?? "",
                listing_price: listing.listing_price ?? "",
                listing_price_max: listing.listing_price_max ?? "",
                listing_price_unit: listing.listing_price_unit ?? "",
                listing_min_order_qty: listing.listing_min_order_qty ?? "",
            }
            : EMPTY
    );

    const [categories, setCategories] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);

    // Category is a foreign key now, so it is picked from the taxonomy.
    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                const res = await fetch(`${BROWSER_API_BASE}/api/categories`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!cancelled) setCategories(data);
            } catch (err) {
                console.error("Could not load categories:", err);
                if (!cancelled) {
                    setStatus({
                        type: "error",
                        message: "Could not load categories. Refresh and try again.",
                    });
                }
            }
        }

        loadCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e) => {
        setPhotos([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        if (!form.listing_title.trim()) {
            setStatus({ type: "error", message: "Please enter a name." });
            return;
        }
        if (!form.category_id) {
            setStatus({ type: "error", message: "Please choose a category." });
            return;
        }

        // A blank price is fine — it shows as "Price on request" publicly.
        for (const [field, label] of [
            ["listing_price", "price"],
            ["listing_price_max", "maximum price"],
        ]) {
            if (form[field] !== "" && isNaN(Number(form[field]))) {
                setStatus({ type: "error", message: `Please enter a valid ${label}.` });
                return;
            }
        }

        setSaving(true);
        try {
            const url = editing
                ? `${BROWSER_API_BASE}/api/listings/${listing.listing_id}`
                : `${BROWSER_API_BASE}/api/vendors/${vendorId}/listings`;

            const res = await fetch(url, {
                method: editing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setStatus({
                    type: "error",
                    message: data.error || "Could not save the listing.",
                });
                return;
            }

            if (photos.length > 0) {
                const formData = new FormData();
                photos.forEach((file) => formData.append("photos", file));

                const photoRes = await fetch(
                    `${BROWSER_API_BASE}/api/listings/${data.listing_id}/photos`,
                    { method: "POST", body: formData }
                );
                const photoData = await photoRes.json();

                if (!photoRes.ok) {
                    setStatus({
                        type: "error",
                        message: photoData.error || "The listing saved, but the photos did not.",
                    });
                    return;
                }
            }

            setStatus({
                type: "success",
                message: editing
                    ? "Listing updated."
                    : "Listing created. It appears publicly once an admin approves it.",
            });
            if (!editing) setForm(EMPTY);
            if (onSaved) onSaved(data);
        } catch (err) {
            console.error("Save failed:", err);
            setStatus({ type: "error", message: "Could not reach the server." });
        } finally {
            setSaving(false);
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
                name="listing_title"
                placeholder="Item name"
                value={form.listing_title}
                onChange={handleChange}
                className="form-input"
            />

            <input
                name="listing_title_bn"
                placeholder="Item name in Bangla (optional)"
                value={form.listing_title_bn}
                onChange={handleChange}
                className="form-input"
            />

            <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="form-input"
            >
                <option value="">Choose a category</option>
                {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                        {c.category_parent_id ? `— ${c.category_name}` : c.category_name}
                    </option>
                ))}
            </select>

            <div className="flex gap-4">
                <input
                    name="listing_price"
                    placeholder="Price in BDT (leave blank for on request)"
                    value={form.listing_price}
                    onChange={handleChange}
                    className="form-input flex-1"
                />
                <input
                    name="listing_price_max"
                    placeholder="Up to (optional)"
                    value={form.listing_price_max}
                    onChange={handleChange}
                    className="form-input flex-1"
                />
            </div>

            <div className="flex gap-4">
                <input
                    name="listing_price_unit"
                    placeholder="Per unit, e.g. kg, piece"
                    value={form.listing_price_unit}
                    onChange={handleChange}
                    className="form-input flex-1"
                />
                <input
                    name="listing_min_order_qty"
                    placeholder="Minimum order (optional)"
                    value={form.listing_min_order_qty}
                    onChange={handleChange}
                    className="form-input flex-1"
                />
            </div>

            <textarea
                name="listing_description"
                placeholder="Description"
                value={form.listing_description}
                onChange={handleChange}
                className="form-input"
            />

            <input
                type="file"
                multiple
                onChange={handlePhotoUpload}
                className="form-input"
            />

            <div className="flex gap-3">
                <button type="submit" className="form-button-primary" disabled={saving}>
                    {saving ? "Saving…" : editing ? "Save changes" : "Publish listing"}
                </button>

                {onCancel && (
                    <button type="button" className="form-button-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
