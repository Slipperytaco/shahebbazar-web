import { AppShell } from "@/components/public/AppShell";
import { BusinessListSkeleton, LoadingAnnouncement, Skeleton } from "@/components/shared/Skeleton";

// Search is the only public route with a loading file, on purpose. A
// loading.tsx makes its segment stream, which commits a 200 before the body
// renders — so a later notFound() can no longer set the status and an unknown
// slug answers 200 with "not found" in the body. /categories/[slug] and
// /business/[slug] both call notFound(), so neither may have one.
//
// The locale defaults to English because a loading file gets no search params.
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
