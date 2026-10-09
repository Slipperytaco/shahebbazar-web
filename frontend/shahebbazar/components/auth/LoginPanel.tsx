"use client";

import { useState } from "react";
import { Building2, UserRound } from "lucide-react";
import { PhoneVerificationForm } from "@/components/auth/PhoneVerificationForm";

type AccountType = "customer" | "vendor";

export function LoginPanel() {
    const [accountType, setAccountType] =
        useState<AccountType>("customer");

    const isCustomer = accountType === "customer";

    return (
        <section className="mx-auto w-full max-w-xl rounded-xl border border-line bg-surface p-6 shadow-raised sm:p-8">
            <header className="text-center">
                <h1 className="text-2xl font-semibold text-ink">
                    Log in to Shahebbazar
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted">
                    Choose your account type, then verify your phone
                    number to continue.
                </p>
            </header>

            <div
                className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-surface-2 p-1.5"
                role="tablist"
                aria-label="Choose account type"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={isCustomer}
                    onClick={() => setAccountType("customer")}
                    className={
                        isCustomer
                            ? "flex items-center justify-center gap-2 rounded-lg bg-surface px-3 py-3 text-sm font-semibold text-brand-600 shadow-card"
                            : "flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
                    }
                >
                    <UserRound className="size-4" />
                    Customer
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={!isCustomer}
                    onClick={() => setAccountType("vendor")}
                    className={
                        !isCustomer
                            ? "flex items-center justify-center gap-2 rounded-lg bg-surface px-3 py-3 text-sm font-semibold text-brand-600 shadow-card"
                            : "flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
                    }
                >
                    <Building2 className="size-4" />
                    Business owner
                </button>
            </div>

            <div
                key={accountType}
                className="mt-6"
                role="tabpanel"
            >
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-ink">
                        {isCustomer
                            ? "Customer login"
                            : "Business owner login"}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-muted">
                        {isCustomer
                            ? "Use the phone number connected to your customer account."
                            : "Use the phone number connected to your registered business account."}
                    </p>
                </div>

                <PhoneVerificationForm
                    locale="en"
                    audience={accountType}
                />
            </div>

            <aside className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
                <h2 className="text-sm font-semibold text-brand-700">
                    Development verification
                </h2>

                <p className="mt-1 text-sm leading-6 text-brand-700">
                    A real six-digit verification code is generated,
                    hashed and stored with an expiry time. Until SMS
                    delivery is enabled, the code appears only in the
                    local API terminal.
                </p>
            </aside>
        </section>
    );
}