import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { CustomerRegistrationForm } from "@/components/auth/CustomerRegistrationForm";
import { AppShell } from "@/components/public/AppShell";

export const metadata: Metadata = {
    title: "Create customer account",
    description:
        "Create a Shahebbazar customer account using phone verification.",
};

export default function CustomerRegistrationPage() {
    return (
        <AppShell locale="en">
            <div className="flex min-h-[640px] items-start justify-center py-8 sm:py-12">
                <section className="w-full max-w-xl rounded-xl border border-line bg-surface p-6 shadow-raised sm:p-8">
                    <header className="text-center">
                        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                            <UserRound className="size-6" />
                        </span>

                        <h1 className="mt-4 text-2xl font-semibold text-ink">
                            Create a customer account
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-muted">
                            Register to save businesses, write
                            reviews, send enquiries and manage
                            customer messages.
                        </p>
                    </header>

                    <div className="mt-6">
                        <CustomerRegistrationForm />
                    </div>
                </section>
            </div>
        </AppShell>
    );
}