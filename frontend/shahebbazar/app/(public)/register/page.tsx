import type { Metadata } from "next";
import Link from "next/link";
import {
    Building2,
    UserRound,
} from "lucide-react";
import { AppShell } from "@/components/public/AppShell";

export const metadata: Metadata = {
    title: "Create an account",
    description:
        "Create a customer account or register a business with Shahebbazar.",
};

export default function RegisterPage() {
    return (
        <AppShell locale="en" current="register">
            <div className="mx-auto w-full max-w-4xl py-8 sm:py-12">
                <header className="text-center">
                    <h1 className="text-3xl font-bold text-ink">
                        Create an account
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                        Choose the type of account you want to create.
                    </p>
                </header>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <section className="flex flex-col rounded-xl border border-line bg-surface p-6 shadow-raised">
                        <span className="grid size-14 place-items-center rounded-xl bg-brand-50 text-brand-600">
                            <UserRound className="size-7" />
                        </span>

                        <h2 className="mt-5 text-xl font-semibold text-ink">
                            Customer account
                        </h2>

                        <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                            Create an account to save businesses,
                            write reviews, send enquiries and manage
                            customer messages.
                        </p>

                        <Link
                            href="/register/customer"
                            className="form-button-primary mt-6 block text-center"
                        >
                            Create customer account
                        </Link>
                    </section>

                    <section className="flex flex-col rounded-xl border border-line bg-surface p-6 shadow-raised">
                        <span className="grid size-14 place-items-center rounded-xl bg-brand-50 text-brand-600">
                            <Building2 className="size-7" />
                        </span>

                        <h2 className="mt-5 text-xl font-semibold text-ink">
                            Business account
                        </h2>

                        <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                            Register a business, submit its details
                            for review and access the business-owner
                            dashboard.
                        </p>

                        <Link
                            href="/vendors/register"
                            className="form-button-primary mt-6 block text-center"
                        >
                            Register a business
                        </Link>
                    </section>
                </div>

                <section className="mt-8 rounded-xl border border-line bg-surface p-5 text-center shadow-raised">
                    <p className="text-sm text-muted">
                        Already have an account?
                    </p>

                    <Link
                        href="/login"
                        className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
                    >
                        Return to login
                    </Link>
                </section>
            </div>
        </AppShell>
    );
}
