import type { Metadata } from "next";

// Provider area.

export const metadata: Metadata = {
    // Authenticated routes are excluded from indexing.
    robots: { index: false, follow: false },
};

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): add the vendor session and role check here; the layout protects every route in this group.
    return children;
}
