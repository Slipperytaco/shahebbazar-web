"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { getViewerState, postReview } from "@/app/(seeker)/actions";

type Copy = {
    writeReview: string;
    updateReview: string;
    yourRating: string;
    reviewPlaceholder: string;
    submitReview: string;
    reviewSaved: string;
    cancel: string;
};

export function ReviewForm({ slug, copy }: { slug: string; copy: Copy }) {
    const [open, setOpen] = useState(false);
    const [hasReview, setHasReview] = useState(false);
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        getViewerState(slug).then((state) => {
            if (!state?.review) return;
            setHasReview(true);
            setRating(state.review.rating);
            setBody(state.review.body ?? "");
        });
    }, [slug]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await postReview(slug, rating, body);
            if (!result.ok) return setError(result.error);
            setHasReview(true);
            setDone(true);
            setOpen(false);
        });
    }

    const buttonClass =
        "mt-4 flex w-full items-center justify-center rounded-[10px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50";

    if (!open) {
        return (
            <>
                {done && (
                    <p role="status" className="mt-4 rounded-lg bg-success-bg px-3 py-2 text-[0.8125rem] text-success-ink">
                        {copy.reviewSaved}
                    </p>
                )}
                <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
                    {hasReview ? copy.updateReview : copy.writeReview}
                </button>
            </>
        );
    }

    return (
        <form onSubmit={submit} className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
            <p className="text-[0.8125rem] font-medium">{copy.yourRating}</p>
            <div className="mt-1 flex gap-1" role="radiogroup" aria-label={copy.yourRating}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} / 5`}
                        onClick={() => setRating(value)}
                        className="p-0.5"
                    >
                        <Star
                            className={`size-6 ${value <= rating ? "fill-star text-star" : "fill-slate-200 text-slate-200"}`}
                        />
                    </button>
                ))}
            </div>
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder={copy.reviewPlaceholder}
                className="mt-3 w-full rounded-[10px] border border-line-strong bg-surface p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100"
            />
            {error && (
                <p role="alert" className="mt-2 text-[0.8125rem] text-error-ink">
                    {error}
                </p>
            )}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-[10px] border border-line-strong bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2"
                >
                    {copy.cancel}
                </button>
                <button
                    type="submit"
                    disabled={pending || rating === 0}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    {copy.submitReview}
                </button>
            </div>
        </form>
    );
}
