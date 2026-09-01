"use client";
import { useState } from "react";

export default function VendorRegister() {
    const [form, setForm] = useState({
        vendor_name: "",
        vendor_email: "",
        vendor_password: "",
        vendor_phone: "",
        vendor_address: "",
        vendor_city: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:4000/api/vendors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();
        console.log("Vendor created:", data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="vendor_name" placeholder="Name" onChange={handleChange} />
            <input name="vendor_email" placeholder="Email" onChange={handleChange} />
            <input name="vendor_password" placeholder="Password" onChange={handleChange} />
            <input name="vendor_phone" placeholder="Phone" onChange={handleChange} />
            <input name="vendor_address" placeholder="Address" onChange={handleChange} />
            <input name="vendor_city" placeholder="City" onChange={handleChange} />
            <button type="submit">Register Vendor</button>
        </form>
    );
}
