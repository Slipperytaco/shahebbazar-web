"use client";
import { useState } from "react";

export default function VendorRegister() {
    // State to store data input 
    const [form, setForm] = useState({
        vendor_name: "",
        vendor_email: "",
        vendor_password: "",
        vendor_phone: "",
        vendor_address: "",
        vendor_city: ""
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

        const res = await fetch("http://localhost:4000/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();
        // log response in console + return error msg or success msg based off API response 
        console.log("Vendor created:", data);

        if (data.success) {
            setStatus({ type: "success", message: "Vendor registered successfully!" });
        } else {
            setStatus({ type: "error", message: "Error registering vendor: " + data.error });
        }

    };
    // determine status class for styling based on success or error
    const statusClass =
        status?.type === "success"
            ? "form-status-success"
            : "form-status-error";

    return (
        <div className="page-center">

            {/* Registration Card */}
            <div className="form-card">

                <h2 className="form-title">Vendor Registration</h2>

                {/* Status Message */}
                {status && (
                    <div className={statusClass}>
                        {status.message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        name="vendor_name"
                        placeholder="Vendor Name"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="vendor_email"
                        placeholder="Email"
                        type="email"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="vendor_password"
                        placeholder="Password"
                        type="password"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="vendor_phone"
                        placeholder="Phone"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="vendor_address"
                        placeholder="Address"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="vendor_city"
                        placeholder="City"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <button type="submit" className="form-button-primary">
                        Register Vendor
                    </button>

                </form>
            </div>
        </div>
    );
}
