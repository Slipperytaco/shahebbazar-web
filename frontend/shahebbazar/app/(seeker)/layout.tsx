import type { Metadata } from "next";

// Authenticated customer area.

export const metadata: Metadata = {
    // Account routes hold personal data and are excluded from indexing.
    robots: { index: false, follow: false },
};

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
    // TODO(auth): add the customer session and role check here, redirecting to /login?next=/account.
    return children;
}
