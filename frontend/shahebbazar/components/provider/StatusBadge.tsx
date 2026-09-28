import type { ListingStatus, VendorStatus } from "@/lib/types";

// Moderation state of a business or listing, in words an owner understands.

type Status = VendorStatus | ListingStatus;

const STYLES: Record<Status, { label: string; className: string }> = {
    approved: { label: "Live", className: "bg-open-bg text-open-ink" },
    pending: { label: "Awaiting approval", className: "bg-sponsor-bg text-sponsor-ink" },
    rejected: { label: "Rejected", className: "bg-shut-bg text-shut-ink" },
    suspended: { label: "Suspended", className: "bg-shut-bg text-shut-ink" },
    draft: { label: "Draft", className: "bg-surface-2 text-muted" },
    archived: { label: "Archived", className: "bg-surface-2 text-muted" },
};

export function StatusBadge({ status }: { status: Status }) {
    const style = STYLES[status] ?? STYLES.draft;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap ${style.className}`}
        >
            {style.label}
        </span>
    );
}
