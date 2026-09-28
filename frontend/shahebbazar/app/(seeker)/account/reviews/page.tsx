import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { AccountShell } from "@/components/customer/AccountShell";
import { apiGet } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { MyReview } from "@/lib/types";

export const metadata: Metadata = {
    title: "My reviews",
};

const STATUS_LABEL: Record<string, string> = {
    published: "Published",
    pending: "Awaiting moderation",
    hidden: "Hidden by a moderator",
    removed: "Removed by a moderator",
};

export default async function MyReviewsPage() {
    const reviews = (await apiGet<MyReview[]>("/me/reviews")) ?? [];

    return (
        <AccountShell current="reviews" title="My reviews">
            {reviews.length === 0 ? (
                <p className="text-sm text-muted">You have not reviewed any business yet.</p>
            ) : (
                <ul className="space-y-3">
                    {reviews.map((review) => (
                        <li key={review.review_id} className="rounded-xl border border-line bg-surface p-4 shadow-card">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Link
                                    href={`/business/${review.vendor_slug}#reviews`}
                                    className="font-semibold hover:text-brand-600"
                                >
                                    {review.vendor_name}
                                </Link>
                                <span className="text-xs text-muted">
                                    {STATUS_LABEL[review.status] ?? review.status} · {formatDateTime(review.created_at)}
                                </span>
                            </div>
                            <div className="mt-1 flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        className={`size-3.5 ${i <= review.rating ? "fill-star text-star" : "fill-slate-200 text-slate-200"}`}
                                    />
                                ))}
                            </div>
                            {review.body && <p className="mt-2 text-sm text-muted">{review.body}</p>}
                            {review.reply && (
                                <div className="mt-3 rounded-lg border-l-2 border-brand-500 bg-surface-2 px-3 py-2">
                                    <p className="text-[0.75rem] font-semibold text-brand-700">Reply from the owner</p>
                                    <p className="mt-0.5 text-[0.8125rem] text-muted">{review.reply}</p>
                                </div>
                            )}
                            {(review.status === "published" || review.status === "pending") && (
                                <Link
                                    href={`/business/${review.vendor_slug}#reviews`}
                                    className="mt-2 inline-block text-[0.8125rem] font-medium text-brand-600 hover:underline"
                                >
                                    Edit review
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </AccountShell>
    );
}
