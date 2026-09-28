import { ImageResponse } from "next/og";
import { getBusiness } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { SITE_URL } from "@/lib/seo";

// Link-preview card for a business with no cover photo, 1200 x 630, sharing the profile page's cache.

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let detail;
    try {
        detail = await getBusiness(slug);
    } catch {
        // The API is down: fall back to the site-wide image rather than no image.
        return Response.redirect(new URL("/og.png", SITE_URL), 307);
    }
    if (!detail) return new Response("Not found", { status: 404 });

    const { business } = detail;
    const rating = toNumber(business.rating);
    const reviews = toNumber(business.review_count);
    const place = [business.primary_category, business.area_name ? `${business.area_name}, Rajshahi` : "Rajshahi"]
        .filter(Boolean)
        .join("  ·  ");
    const name = business.vendor_name;
    const host = new URL(SITE_URL).host;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: "#f6f8fc",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ width: 24, height: "100%", background: "#2563eb", display: "flex" }} />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "64px 72px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#2563eb" }}>
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" strokeWidth="1.5">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                            <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
                        </svg>
                        <span style={{ fontSize: 38, fontWeight: 700 }}>Shahebbazar</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <span
                            style={{
                                fontSize: name.length > 34 ? 60 : 76,
                                fontWeight: 700,
                                color: "#0f172a",
                                lineHeight: 1.05,
                                letterSpacing: -2,
                                maxWidth: 1000,
                            }}
                        >
                            {name}
                        </span>
                        <span style={{ fontSize: 34, color: "#64748b" }}>{place}</span>
                        {reviews > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 34, color: "#0f172a" }}>
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="#f59e0b">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span style={{ fontWeight: 700 }}>{rating.toFixed(1)}</span>
                                <span style={{ color: "#64748b" }}>
                                    ({reviews} review{reviews === 1 ? "" : "s"})
                                </span>
                            </div>
                        )}
                    </div>

                    <span style={{ fontSize: 26, color: "#94a3b8" }}>
                        {host}/business/{business.vendor_slug}
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
        }
    );
}
