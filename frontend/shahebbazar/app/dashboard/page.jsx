"use client";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
    const user = useAuth();

    if (!user) {
        return (
            <div className="page-center">
                <div className="form-card text-center">
                    <h2 className="form-title">Please Log In</h2>
                    <p className="text-gray-400 text-sm mt-2">
                        You must be logged in to access your dashboard.
                    </p>

                    <a href="/login" className="form-button-primary text-center mt-6">
                        Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="page-center">
            <div className="form-card">
                <h2 className="form-title">Welcome, {user.user_name}</h2>
                <p className="text-gray-400 text-sm mt-2">
                    Choose an option below to continue.
                </p>

                <div className="flex flex-col gap-3 mt-6">
                    <a href="/vendors/register" className="form-button-primary text-center">
                        Register Vendor
                    </a>

                    <a href="/vendors" className="form-button-primary text-center">
                        View Vendors
                    </a>

                    <a href="/search" className="form-button-primary text-center">
                        Search Vendors
                    </a>
                </div>
            </div>
        </div>
    );
}
