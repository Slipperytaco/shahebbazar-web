"use client";
import { useState } from "react";

export default function Login() {
    const [form, setForm] = useState({
        user_email: "",
        user_password: ""
    });

    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));

            setStatus({ type: "success", message: "Logged in successfully" });
        } else {
            setStatus({ type: "error", message: data.error });
        }
    };

    let statusClass = "";
    if (status?.type === "success") statusClass = "form-status-success";
    if (status?.type === "error") statusClass = "form-status-error";

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="form-card">
                <h2 className="form-title">Login</h2>

                {status && (
                    <div className={statusClass}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="user_email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <input
                        name="user_password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="form-input"
                    />

                    <button type="submit" className="form-button-primary">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
