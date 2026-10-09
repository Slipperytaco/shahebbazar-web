"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth-client";

export function LogoutButton({
    className = "",
}: {
    className?: string;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogout() {
        if (busy) {
            return;
        }

        setBusy(true);
        setError(null);

        const result = await logout();
        if (!result.ok) {
            setError(result.error);
            setBusy(false);
            return;
        }

        router.replace("/login");
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                <LogOut className="size-4" aria-hidden="true" />
                {busy ? "Logging out..." : "Log out"}
            </button>

            {error && (
                <p role="alert" className="mt-1 text-xs text-error-ink">
                    {error}
                </p>
            )}
        </div>
    );
}
