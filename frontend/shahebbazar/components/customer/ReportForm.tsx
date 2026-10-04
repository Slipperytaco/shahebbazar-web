"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { sendReport } from "@/app/(seeker)/actions";
import type { ReportTargetType } from "@/lib/types";

const REASONS = [
    { value: "wrong_info", label: "Wrong or outdated information" },
    { value: "fake", label: "Fake business or profile" },
    { value: "fake_review", label: "Fake review" },
    { value: "scam", label: "Scam or fraud" },
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Offensive or inappropriate" },
    { value: "other", label: "Something else" },
];

export function ReportForm({
    targetType,
    targetId,
    backHref,
}: {
    targetType: ReportTargetType;
    targetId: number;
    backHref: string;
}) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [pending, startTransition] = useTransition();

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await sendReport(targetType, targetId, reason, details);
            if (result.ok) setSent(true);
            else setError(result.error);
        });
    }

    if (sent) {
        return (
            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
                <p role="status" className="text-sm font-medium text-success-ink">
                    Thank you. Our team will review your report.
                </p>
                <Link href={backHref} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
                    Go back
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-card">
            <fieldset>
                <legend className="text-sm font-semibold">What is wrong?</legend>
                <div className="mt-2 space-y-1.5">
                    {REASONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                            <input
                                type="radio"
                                name="reason"
                                value={option.value}
                                checked={reason === option.value}
                                onChange={() => setReason(option.value)}
                                className="accent-brand-600"
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </fieldset>
            <label className="block text-sm font-semibold">
                Details <span className="font-normal text-muted">(optional)</span>
                <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="mt-1.5 w-full rounded-[10px] border border-line-strong bg-surface p-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
                />
            </label>
            {error && (
                <p role="alert" className="text-[0.8125rem] text-error-ink">
                    {error}
                </p>
            )}
            <div className="flex gap-2">
                <Link
                    href={backHref}
                    className="rounded-[10px] border border-line-strong bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={pending || !reason}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-error-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    Send report
                </button>
            </div>
        </form>
    );
}
