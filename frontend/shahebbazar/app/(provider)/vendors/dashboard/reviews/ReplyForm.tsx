"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveReviewReply } from "../owner-actions";

export function ReplyForm({ vendorId, reviewId, initial }: { vendorId: number; reviewId: number; initial: string | null }) {
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(initial ?? "");
    const [text, setText] = useState(initial ?? "");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function save(reply: string) {
        setError(null);
        startTransition(async () => {
            const result = await saveReviewReply(vendorId, reviewId, reply);
            if (!result.ok) return setError(result.error);
            setSaved(reply.trim());
            setText(reply.trim());
            setEditing(false);
        });
    }

    if (!editing) {
        return (
            <div className="mt-3">
                {saved && (
                    <div className="rounded-lg border-l-2 border-brand-500 bg-surface-2 px-3 py-2">
                        <p className="text-[0.75rem] font-semibold text-brand-700">Your reply (public)</p>
                        <p className="mt-0.5 text-[0.8125rem] text-muted">{saved}</p>
                    </div>
                )}
                <div className="mt-2 flex gap-3">
                    <button type="button" onClick={() => setEditing(true)} className="text-[0.8125rem] font-medium text-brand-600 hover:underline">
                        {saved ? "Edit reply" : "Reply"}
                    </button>
                    {saved && (
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => save("")}
                            className="text-[0.8125rem] font-medium text-error-ink hover:underline disabled:opacity-50"
                        >
                            Delete reply
                        </button>
                    )}
                </div>
                {error && <p role="alert" className="mt-1 text-[0.8125rem] text-error-ink">{error}</p>}
            </div>
        );
    }

    return (
        <div className="mt-3">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={1000}
                aria-label="Your reply"
                placeholder="Thank the customer or answer their concern. Everyone can see this reply."
                className="w-full rounded-[10px] border border-line-strong bg-surface p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            />
            {error && <p role="alert" className="mt-1 text-[0.8125rem] text-error-ink">{error}</p>}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setText(saved);
                        setEditing(false);
                    }}
                    className="rounded-[10px] border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={pending || text.trim() === ""}
                    onClick={() => save(text)}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    Post reply
                </button>
            </div>
        </div>
    );
}
