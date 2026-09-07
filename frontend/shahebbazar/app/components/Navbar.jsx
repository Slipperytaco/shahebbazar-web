"use client";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
    const user = useAuth();
    const [open, setOpen] = useState(false);

    return (
        <nav className="w-full bg-[#1877F2] text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <h1 className="text-xl font-semibold">ShahebBazar</h1>

                <div className="flex gap-6 text-sm items-center">

                    {/* General navigation */}
                    <a href="/" className="hover:opacity-80">Home</a>
                    <a href="/vendors" className="hover:opacity-80">Vendors</a>
                    <a href="/search" className="hover:opacity-80">Search</a>

                    {/* Vendor dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpen(!open)}
                            className="hover:opacity-80"
                        >
                            Vendor ▾
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg w-48 p-2 flex flex-col">
                                <a href="/vendors/register" className="p-2 hover:bg-gray-100">Vendor Sign Up</a>
                                <a href="/vendors/dashboard" className="p-2 hover:bg-gray-100">Vendor Dashboard</a>
                                <a href="/vendors/dashboard/add-listing" className="p-2 hover:bg-gray-100">Add Listing</a>
                            </div>
                        )}
                    </div>

                    {/* User section */}
                    {user ? (
                        <>
                            <span className="opacity-90">Hi, {user.user_name}</span>
                            <a href="/dashboard" className="hover:opacity-80">Dashboard</a>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("user");
                                    window.location.href = "/";
                                }}
                                className="hover:opacity-80"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="hover:opacity-80">Login</a>
                            <a href="/register" className="hover:opacity-80">Register</a>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
