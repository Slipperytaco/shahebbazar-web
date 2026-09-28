import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiGet, getVendorSummary } from "@/lib/api";
import { ProviderShell, parseVendorParam, providerHref } from "@/components/provider/ProviderShell";
import { ThreadView } from "@/components/messaging/ThreadView";
import type { ConversationThread } from "@/lib/types";
import { replyAsOwner } from "../../owner-actions";

export const metadata: Metadata = {
    title: "Conversation",
};

export default async function OwnerConversationPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ vendor?: string }>;
}) {
    const [{ id }, query] = await Promise.all([params, searchParams]);
    const vendorId = parseVendorParam(query.vendor);
    if (vendorId === null) redirect("/vendors/dashboard");
    if (!/^\d{1,10}$/.test(id)) notFound();

    const [vendor, thread] = await Promise.all([
        getVendorSummary(vendorId),
        apiGet<ConversationThread>(`/vendors/${vendorId}/conversations/${id}`),
    ]);
    if (!vendor || !thread) notFound();

    return (
        <ProviderShell vendor={vendor} current="messages">
            <Link
                href={providerHref("/vendors/dashboard/messages", vendorId)}
                className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
                <ChevronLeft className="size-4" /> All messages
            </Link>
            <ThreadView
                thread={thread}
                otherName={thread.conversation.customer_name}
                send={replyAsOwner.bind(null, vendorId, Number(id))}
            />
        </ProviderShell>
    );
}
