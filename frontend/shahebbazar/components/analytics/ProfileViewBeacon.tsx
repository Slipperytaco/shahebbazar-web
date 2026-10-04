"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendAnalytics, viewSource } from "@/lib/analytics";

// Reports one view of a business profile once it is on screen.
export function ProfileViewBeacon({ slug }: { slug: string }) {
    const pathname = usePathname();

    useEffect(() => {
        sendAnalytics("/api/track/view", { slug, source: viewSource(pathname) });
    }, [slug, pathname]);

    return null;
}
