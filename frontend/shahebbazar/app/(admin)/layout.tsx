import type { Metadata } from "next";

// Administration area.

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): add the admin session and role check here; use notFound() so the area is not disclosed.
    return children;
}
