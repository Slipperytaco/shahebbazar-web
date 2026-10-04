"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import type { SendResult } from "@/lib/api";

// Text box that sends a message through the given server action, then refreshes or redirects.
export function MessageForm({
    send,
    placeholder = "Write a message…",
    submitLabel = "Send",
    redirectTo,
}: {
    send: (body: string) => Promise<SendResult<{ conversation_id?: number } | unknown>>;
    placeholder?: string;
    submitLabel?: string;
    redirectTo?: string;
}) {
    const router = useRouter();
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await send(body);
            if (!result.ok) return setError(result.error);
            setBody("");
            const id = (result.data as { conversation_id?: number } | null)?.conversation_id;
            if (redirectTo) router.push(id ? `${redirectTo}/${id}` : redirectTo);
            else router.refresh();
        });
    }

    return (
        <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-3 shadow-card">
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={2000}
                required
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full resize-y rounded-[10px] border border-line-strong bg-surface p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            />
            {error && (
                <p role="alert" className="mt-2 text-[0.8125rem] text-error-ink">
                    {error}
                </p>
            )}
            <div className="mt-2 flex justify-end">
                <button
                    type="submit"
                    disabled={pending || body.trim() === ""}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
