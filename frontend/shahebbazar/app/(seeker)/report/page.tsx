import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/public/AppShell";
import { ReportForm } from "@/components/customer/ReportForm";
import type { ReportTargetType } from "@/lib/types";

export const metadata: Metadata = {
    title: "Report a problem",
};

const TYPES: Record<ReportTargetType, string> = {
    vendor: "business",
    listing: "product",
    review: "review",
    message: "message",
};

// Turns the back parameter into a safe in-site path: a slug means a business page.
function backPath(back: string | undefined): string {
    if (!back) return "/";
    if (back.startsWith("/") && !back.startsWith("//") && !back.includes("\\")) return back;
    return /^[a-z0-9-]+$/.test(back) ? `/business/${back}` : "/";
}

export default async function ReportPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; id?: string; back?: string }>;
}) {
    const { type, id, back } = await searchParams;
    if (!type || !(type in TYPES) || !id || !/^\d{1,10}$/.test(id)) notFound();
    const targetType = type as ReportTargetType;

    return (
        <AppShell locale="en">
            <div className="max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight">Report this {TYPES[targetType]}</h1>
                <p className="mt-1 mb-4 text-sm text-muted">
                    Reports go to the Shahebbazar team. The other person is not told who reported them.
                </p>
                <ReportForm targetType={targetType} targetId={Number(id)} backHref={backPath(back)} />
            </div>
        </AppShell>
    );
}
