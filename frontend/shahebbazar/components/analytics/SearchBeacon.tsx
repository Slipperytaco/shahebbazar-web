"use client";

import { useEffect } from "react";
import { sendAnalytics } from "@/lib/analytics";

type Props = {
    q: string;
    category?: string;
    area?: string;
    /** Total matches, as shown in "Showing 1–20 of N". */
    resultCount: number;
    /** Businesses shown on the page, sponsored rows included. */
    vendorIds: number[];
};

// Reports one typed search, and which businesses appeared for it, once the results are on screen.
export function SearchBeacon(props: Props) {
    // A string key makes the effect run once per distinct search, not on every render.
    const key = JSON.stringify(props);

    useEffect(() => {
        sendAnalytics("/api/track/search", JSON.parse(key));
    }, [key]);

    return null;
}
