import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PhoneVerificationForm } from "@/components/auth/PhoneVerificationForm";

export const metadata: Metadata = {
    title: "Administrator login",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLoginPage() {
    return (
        <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-12">
            <section className="w-full rounded-2xl border border-line bg-surface p-6 shadow-card">
                <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <ShieldCheck className="size-6" />
                    </span>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Administrator login
                        </h1>

                        <p className="mt-1 text-sm text-muted">
                            Restricted to administrator accounts.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <PhoneVerificationForm
                        locale="en"
                        audience="admin"
                    />
                </div>

                <p className="mt-5 text-center text-sm text-muted">
                    <Link href="/login" className="hover:underline">
                        Return to customer login
                    </Link>
                </p>
            </section>
        </main>
    );
}
