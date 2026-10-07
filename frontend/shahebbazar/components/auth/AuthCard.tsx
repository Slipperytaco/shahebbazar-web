import type { ReactNode } from "react";

type AuthCardProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export function AuthCard({
    title,
    description,
    children,
}: AuthCardProps) {
    return (
        <main className="mx-auto my-10 w-full max-w-md px-4">
            <section className="rounded-xl border border-line bg-surface p-6 shadow-raised sm:p-8">
                <h1 className="text-center text-2xl font-semibold text-ink">
                    {title}
                </h1>

                {description && (
                    <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-muted">
                        {description}
                    </p>
                )}

                <div className="mt-6">{children}</div>
            </section>
        </main>
    );
}