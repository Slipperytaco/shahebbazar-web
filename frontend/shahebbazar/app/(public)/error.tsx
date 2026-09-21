"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

// Error boundaries must be Client Components, so the locale helpers are not
// available here and the copy is given in both languages instead.
//
// Note the recovery prop is `retry` in this version of Next.js, not `reset`.
export default function PublicError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        // No error reporting service yet, so this is just the server log.
        console.error("Public page failed to render:", error);
    }, [error]);

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight">
                Something went wrong
            </h1>
            <p className="mt-2 text-[0.9375rem] text-muted">
                We could not load this page. The directory may be briefly
                unavailable — trying again usually works.
            </p>
            <p className="mt-1 text-[0.9375rem] text-muted" lang="bn">
                এই পৃষ্ঠাটি লোড করা যায়নি। আবার চেষ্টা করুন।
            </p>

            <button
                type="button"
                onClick={() => retry()}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
                <RefreshCw className="size-4" />
                Try again
            </button>

            {/* Enough to find the failure in the log, without a stack trace. */}
            {error.digest && (
                <p className="mt-6 text-[0.75rem] text-muted">
                    Reference: <code>{error.digest}</code>
                </p>
            )}
        </main>
    );
}
