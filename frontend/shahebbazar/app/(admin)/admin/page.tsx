import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin",
};

/** Placeholder route. Replace with the administration interface. */
export default function AdminHomePage() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <h1 className="text-2xl font-semibold tracking-tight">Admin portal</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
                Not yet implemented. See{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                    app/(admin)/layout.tsx
                </code>{" "}
                for the scope of this area and the database views that support it.
            </p>
        </main>
    );
}
