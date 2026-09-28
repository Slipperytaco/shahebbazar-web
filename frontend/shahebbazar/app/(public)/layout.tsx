import type { Metadata } from "next";

// Public area.

export const metadata: Metadata = {
    robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    // Page chrome is applied per page through <AppShell>, because layouts cannot read the locale parameter.
    return children;
}
