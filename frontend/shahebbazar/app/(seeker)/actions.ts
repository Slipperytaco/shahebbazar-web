"use server";

import { revalidatePath } from "next/cache";
import { apiGet, apiSend, type SendResult } from "@/lib/api";
import type { ReportTargetType, ViewerState } from "@/lib/types";

// TODO(auth): every action here acts as the stand-in customer until sign-in exists.

// Loads whether the customer saved this business and their review of it.
export async function getViewerState(slug: string): Promise<ViewerState | null> {
    return apiGet<ViewerState>(`/me/businesses/${encodeURIComponent(slug)}`).catch(() => null);
}

// Loads the ids of every business the customer has saved.
export async function getSavedIds(): Promise<number[]> {
    return (await apiGet<number[]>("/me/saved-ids").catch(() => null)) ?? [];
}

// Saves or unsaves a business.
export async function setSaved(vendorId: number, saved: boolean): Promise<SendResult> {
    const result = await apiSend(saved ? "PUT" : "DELETE", `/me/saved/${vendorId}`);
    revalidatePath("/account", "layout");
    return result;
}

// Posts or updates the customer's review, then refreshes cached ratings.
export async function postReview(slug: string, rating: number, body: string): Promise<SendResult> {
    const result = await apiSend("POST", `/businesses/${encodeURIComponent(slug)}/reviews`, { rating, body });
    if (result.ok) revalidatePath("/", "layout");
    return result;
}

// Sends a report about a business, product, review or message.
export async function sendReport(
    targetType: ReportTargetType,
    targetId: number,
    reason: string,
    details: string
): Promise<SendResult> {
    return apiSend("POST", "/reports", { target_type: targetType, target_id: targetId, reason, details });
}

// Starts a conversation with a business, optionally about one product.
export async function startConversation(
    vendorId: number,
    listingId: number | null,
    body: string
): Promise<SendResult<{ conversation_id: number }>> {
    const result = await apiSend<{ conversation_id: number }>("POST", "/me/conversations", {
        vendor_id: vendorId,
        listing_id: listingId,
        body,
    });
    revalidatePath("/account", "layout");
    return result;
}

// Sends a reply in one of the customer's conversations.
export async function replyAsCustomer(conversationId: number, body: string): Promise<SendResult> {
    const result = await apiSend("POST", `/me/conversations/${conversationId}/messages`, { body });
    revalidatePath(`/account/messages/${conversationId}`);
    return result;
}

// Marks all the customer's alerts as read.
export async function markMyAlertsRead(): Promise<void> {
    await apiSend("POST", "/me/alerts/read");
    revalidatePath("/account");
}
