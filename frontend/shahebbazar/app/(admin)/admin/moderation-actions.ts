"use server";

import { revalidatePath } from "next/cache";
import { apiSend, type SendResult } from "@/lib/api";

// TODO(auth): verify the signed-in user is an admin in both actions.

// Dismisses a report, or takes the reported item down.
export async function resolveReport(reportId: number, action: "dismiss" | "take_down"): Promise<SendResult> {
    const result = await apiSend("POST", `/admin/reports/${reportId}/resolve`, { action });
    revalidatePath("/", "layout");
    return result;
}

// Hides a review from the public site, or restores it.
export async function setReviewStatus(reviewId: number, status: "published" | "hidden"): Promise<SendResult> {
    const result = await apiSend("POST", `/admin/reviews/${reviewId}/status`, { status });
    revalidatePath("/", "layout");
    return result;
}
