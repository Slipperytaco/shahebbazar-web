import type { Metadata } from "next";
import { AppShell } from "@/components/public/AppShell";
import { LoginPanel } from "@/components/auth/LoginPanel";


export const metadata: Metadata = {
    title: "Log in",
    description:
        "Log in to a Shahebbazar customer or business account using phone verification.",
};

export default function LoginPage() {
    return (
        <AppShell locale="en">
            <div className="flex min-h-[640px] items-start justify-center py-8 sm:py-12">
                <LoginPanel />
            </div>
        </AppShell>
    );
}