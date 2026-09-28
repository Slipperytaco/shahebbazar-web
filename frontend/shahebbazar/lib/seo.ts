import type { Metadata } from "next";

// Page metadata for the public site: title, description, canonical URL and OpenGraph tags.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "Shahebbazar";

/** Site-wide share image, generated at build time by app/og.png/route.tsx. */
export const DEFAULT_OG_IMAGE = {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Shahebbazar — find trusted businesses and services in Rajshahi",
};

/** Share card for one business, used when it has no cover photo. */
export function businessOgImage(slug: string, name: string) {
    return { url: `/og/business/${encodeURIComponent(slug)}`, width: 1200, height: 630, alt: name };
}

type OgImage = { url: string; width?: number; height?: number; alt?: string };

export function pageMetadata({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    noindex = false,
}: {
    /** Page title; the root layout's template appends " | Shahebbazar". */
    title: string;
    description: string;
    /** Canonical path, e.g. "/business/padma-view-restaurant". */
    path: string;
    image?: OgImage;
    /** Keep out of search results but still follow its links. */
    noindex?: boolean;
}): Metadata {
    return {
        title,
        description,
        alternates: { canonical: path },
        ...(noindex ? { robots: { index: false, follow: true } } : {}),
        openGraph: {
            type: "website",
            siteName: SITE_NAME,
            locale: "en_GB",
            alternateLocale: "bn_BD",
            title,
            description,
            url: path,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image.url],
        },
    };
}
