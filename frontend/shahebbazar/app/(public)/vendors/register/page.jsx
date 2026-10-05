"use client";
import { useState } from "react";

export default function VendorRegister() {
    // State to store data input 
    const [form, setForm] = useState({
        vendor_name: "",
        vendor_email: "",
        vendor_phone: "",
        vendor_address: "",
        vendor_city: "",
        vendor_nid_reference: "",
    });
    // status msg - success or error: 
    const [status, setStatus] = useState(null);

    // handle input change 
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // submits form to backend api 
    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus(null);

        try {
            const res = await fetch(
                "http://localhost:4000/api/vendors",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data.error || "Unable to register vendor."
                });
                return;
            }

            setStatus({
                type: "success",
                message:
                    "Vendor registered. NID verification is pending."
            });

            setForm({
                vendor_name: "",
                vendor_email: "",
                vendor_phone: "",
                vendor_address: "",
                vendor_city: "",
                vendor_nid_reference: ""
            });
        } catch (err) {
            console.error("Vendor registration request failed:", err);

            setStatus({
                type: "error",
                message: "Unable to contact the registration service."
            });
        }
    };
    let statusClass = "";
    if (status?.type === "success") statusClass = "form-status-success";
    if (status?.type === "error") statusClass = "form-status-error";

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="form-card">
                <h2 className="form-title">Vendor Registration</h2>
                {status && (
                    <div className={statusClass}>
                        {status.message}
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <form onSubmit={handleSubmit}>
                        <input name="vendor_name" placeholder="Business name (required)" value={form.vendor_name} onChange={handleChange} className="form-input" required/>
                        <input name="vendor_email" placeholder="Email" value={form.vendor_email} onChange={handleChange} className="form-input" required />
                        <input name="vendor_phone" placeholder="Phone (required)" value={form.vendor_phone} onChange={handleChange} className="form-input" required />
                        <input name="vendor_address" placeholder="Address" value={form.vendor_address} onChange={handleChange} className="form-input" required/>
                        <input name="vendor_city" placeholder="Area, e.g. Kazla" value={form.vendor_city} onChange={handleChange} className="form-input" required/>
                        <label
                            htmlFor="vendor_nid_reference"
                            className="block text-sm font-medium"
                        >
                            National ID reference
                        </label>

                        <input
                            id="vendor_nid_reference"
                            name="vendor_nid_reference"
                            type="text"
                            placeholder="National ID reference (required)"
                            value={form.vendor_nid_reference}
                            onChange={handleChange}
                            className="form-input"
                            autoComplete="off"
                            required
                        />

                        <p className="mb-4 text-sm text-gray-500">
                            The NID reference will be submitted for verification. New vendor
                            registrations remain pending until reviewed.
                        </p>
                        <button type="submit" className="form-button-primary">
                            Register Vendor
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
