import { AppShell } from "@/components/public/AppShell";
import { BusinessListSkeleton, LoadingAnnouncement, Skeleton } from "@/components/shared/Skeleton";

// Only search has a loading file: on a route that calls notFound() it would turn the 404 into a 200.
export default function Loading() {
    return (
        <AppShell locale="en" current="/search">
            <LoadingAnnouncement label="Loading" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-4 h-8 w-72" />
            <Skeleton className="mt-3 h-3.5 w-48" />
            <Skeleton className="mt-5 h-12 w-full rounded-xl" />

            <div className="mt-5">
                <BusinessListSkeleton />
            </div>
        </AppShell>
    );
}
