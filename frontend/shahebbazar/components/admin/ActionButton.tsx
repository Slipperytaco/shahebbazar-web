"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { SendResult } from "@/lib/api";

const TONES = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    danger: "bg-error-ink text-white hover:opacity-90",
    neutral: "border border-line-strong bg-surface text-ink hover:bg-surface-2",
};

// Button that runs a bound server action and shows its error, if any.
export function ActionButton({
    action,
    label,
    tone = "neutral",
    confirm,
}: {
    action: () => Promise<SendResult>;
    label: string;
    tone?: keyof typeof TONES;
    confirm?: string;
}) {
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function run() {
        if (confirm && !window.confirm(confirm)) return;
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (!result.ok) setError(result.error);
        });
    }

    return (
        <span className="inline-flex flex-col">
            <button
                type="button"
                onClick={run}
                disabled={pending}
                className={`inline-flex items-center gap-2 rounded-[10px] px-3.5 py-1.5 text-sm font-medium disabled:opacity-50 ${TONES[tone]}`}
            >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {label}
            </button>
            {error && (
                <span role="alert" className="mt-1 text-[0.75rem] text-error-ink">
                    {error}
                </span>
            )}
        </span>
    );
}
