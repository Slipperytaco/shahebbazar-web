import { Building2 } from "lucide-react";
import { AppShell } from "@/components/public/AppShell";
import { VendorRegistrationForm } from "@/components/auth/VendorRegistrationForm";

export const metadata = {
    title: "Register your business",
    description:
        "Create a Shahebbazar business account and submit the business for verification.",
};

export default function VendorRegisterPage() {
    return (
        <AppShell locale="en" current="add-business">
            <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
                <header className="text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Building2 className="size-6" />
                    </span>

                    <h1 className="mt-4 text-3xl font-bold text-ink">
                        Register your business
                    </h1>

                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                        Create a business account for Shahebbazar.
                        New registrations remain pending until the
                        business and NID reference are reviewed.
                    </p>
                </header>

                <div className="mt-8">
                    <VendorRegistrationForm />
                </div>
            </div>
        </AppShell>
    );
}