import type { Metadata } from "next";
import { AccountShell } from "@/components/customer/AccountShell";
import { ConversationList } from "@/components/messaging/ConversationList";
import { authenticatedApiGet } from "@/lib/auth-server";
import type { ConversationSummary } from "@/lib/types";

export const metadata: Metadata = {
    title: "Messages",
};

export default async function MessagesPage() {
    const conversations =
        (await authenticatedApiGet<
            ConversationSummary[]
        >("/me/conversations")) ?? [];
    return (
        <AccountShell current="messages" title="Messages">
            <ConversationList
                conversations={conversations}
                hrefFor={(id) => `/account/messages/${id}`}
                show="business"
                empty="No messages yet. Use the Message button on any business page to ask a question."
            />
        </AccountShell>
    );
}
