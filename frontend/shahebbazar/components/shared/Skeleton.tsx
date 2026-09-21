// Loading placeholders. Shapes mirror the real content so the layout does not
// jump, and they are hidden from screen readers — the status is announced once
// by LoadingAnnouncement instead.

export function Skeleton({ className = "" }: { className?: string }) {
    return <span className={`block animate-pulse rounded bg-surface-2 ${className}`} />;
}

export function BusinessRowSkeleton() {
    return (
        <div className="flex gap-4 p-4">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2.5 py-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function BusinessListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            {Array.from({ length: rows }, (_, i) => (
                <BusinessRowSkeleton key={i} />
            ))}
        </div>
    );
}

export function LoadingAnnouncement({ label }: { label: string }) {
    return (
        <span role="status" aria-live="polite" className="sr-only">
            {label}
        </span>
    );
}
