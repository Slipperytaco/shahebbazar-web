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
        console.log("API Response:", data);
        // log response in console + return error msg or success msg based off API response 
        console.log("Vendor created:", data);

        if (data.success) {
            setStatus({ type: "success", message: "Vendor registered successfully!" });
        } else {
            setStatus({ type: "error", message: "Error registering vendor: " + data.error });
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
                        <input name="vendor_name" placeholder="BusinessName" onChange={handleChange} className="form-input" />
                        <input name="vendor_email" placeholder="Email" onChange={handleChange} className="form-input" />
                        <input name="vendor_password" placeholder="Password" onChange={handleChange} className="form-input" />
                        <input name="vendor_phone" placeholder="Phone" onChange={handleChange} className="form-input" />
                        <input name="vendor_address" placeholder="Address" onChange={handleChange} className="form-input" />
                        <input name="vendor_city" placeholder="City" onChange={handleChange} className="form-input" />
                        <button type="submit" className="form-button-primary">
                            Register Vendor
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
