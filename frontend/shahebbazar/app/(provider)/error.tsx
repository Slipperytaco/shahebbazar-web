"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

// The recovery prop is `retry` in this version of Next.js, not `reset`.
export default function ProviderError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error("Provider page failed to render:", error);
    }, [error]);

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight">
                Something went wrong
            </h1>
            <p className="mt-2 text-[0.9375rem] text-muted">
                We could not load your dashboard. Trying again usually works; if it keeps
                happening, the server may be down.
            </p>

            <div className="mt-6 flex gap-3">
                <button
                    type="button"
                    onClick={() => retry()}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                    <RefreshCw className="size-4" />
                    Try again
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-[10px] border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                >
                    Go to home page
                </Link>
            </div>

            {error.digest && (
                <p className="mt-6 text-[0.75rem] text-muted">
                    Reference: <code>{error.digest}</code>
                </p>
            )}
        </main>
    );
}
