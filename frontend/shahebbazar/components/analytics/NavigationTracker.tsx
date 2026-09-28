"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPath } from "@/lib/analytics";

// Remembers the previous path across client navigation, so a profile view can be attributed to its source.
export function NavigationTracker() {
    const pathname = usePathname();

    useEffect(() => {
        recordPath(pathname);
    }, [pathname]);

    return null;
}
