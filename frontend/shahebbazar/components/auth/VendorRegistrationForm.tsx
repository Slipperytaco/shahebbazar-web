"use client";

import {
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import {
    IdCard,
    MapPin,
    UserRound,
} from "lucide-react";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000";

const EMPTY_FORM = {
    vendor_name: "",
    vendor_email: "",
    vendor_phone: "",
    vendor_address: "",
    vendor_city: "",
    vendor_nid_reference: "",
};

type VendorForm = typeof EMPTY_FORM;

type FormStatus =
    | {
          type: "success" | "error";
          message: string;
      }
    | null;

export function VendorRegistrationForm() {
    const [form, setForm] =
        useState<VendorForm>(EMPTY_FORM);
    const [status, setStatus] =
        useState<FormStatus>(null);
    const [submitting, setSubmitting] =
        useState(false);

    function handleChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSubmitting(true);
        setStatus(null);

        try {
            const response = await fetch(
                `${API_BASE}/api/vendors`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = (await response
                .json()
                .catch(() => null)) as {
                error?: string;
            } | null;

            if (!response.ok) {
                setStatus({
                    type: "error",
                    message:
                        data?.error ||
                        "Unable to register the business.",
                });

                return;
            }

            setStatus({
                type: "success",
                message:
                    "Business registration submitted. NID verification and business approval are pending.",
            });

            setForm(EMPTY_FORM);
        } catch (error) {
            console.error(
                "Vendor registration failed:",
                error
            );

            setStatus({
                type: "error",
                message:
                    "Unable to contact the registration service.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {status && (
                <div
                    role={
                        status.type === "error"
                            ? "alert"
                            : "status"
                    }
                    className={
                        status.type === "success"
                            ? "form-status-success mb-0"
                            : "form-status-error mb-0"
                    }
                >
                    {status.message}
                </div>
            )}

            <section className="rounded-xl border border-line bg-surface p-5 shadow-raised sm:p-6">
                <SectionHeading
                    icon={<UserRound className="size-5" />}
                    title="Business contact"
                    description="Enter the contact details connected to the business account."
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field
                        id="vendor_name"
                        label="Business name"
                        value={form.vendor_name}
                        placeholder="Business name"
                        onChange={handleChange}
                    />

                    <Field
                        id="vendor_email"
                        label="Email address"
                        type="email"
                        value={form.vendor_email}
                        placeholder="name@example.com"
                        onChange={handleChange}
                    />

                    <div className="sm:col-span-2">
                        <Field
                            id="vendor_phone"
                            label="Phone number"
                            type="tel"
                            value={form.vendor_phone}
                            placeholder="Local or international mobile number"
                            onChange={handleChange}
                        />

                        <p className="mt-1.5 text-xs leading-5 text-muted">
                            Enter a local Australian or Bangladesh
                            mobile number, or use international
                            format with a country code.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-line bg-surface p-5 shadow-raised sm:p-6">
                <SectionHeading
                    icon={<MapPin className="size-5" />}
                    title="Business location"
                    description="Add the address customers will use to find the business."
                />

                <div className="mt-5 grid gap-4">
                    <Field
                        id="vendor_address"
                        label="Street address"
                        value={form.vendor_address}
                        placeholder="Business address"
                        onChange={handleChange}
                    />

                    <Field
                        id="vendor_city"
                        label="City or area"
                        value={form.vendor_city}
                        placeholder="For example, Kazla"
                        onChange={handleChange}
                    />
                </div>
            </section>

            <section className="rounded-xl border border-line bg-surface p-5 shadow-raised sm:p-6">
                <SectionHeading
                    icon={<IdCard className="size-5" />}
                    title="Identity verification"
                    description="Provide the development NID reference for review."
                />

                <div className="mt-5">
                    <Field
                        id="vendor_nid_reference"
                        label="National ID reference"
                        value={form.vendor_nid_reference}
                        placeholder="National ID reference"
                        onChange={handleChange}
                    />
                </div>

                <p className="mt-3 rounded-lg border border-line bg-surface-2 p-3 text-xs leading-5 text-muted">
                    New business registrations remain pending
                    until the NID reference and business are
                    reviewed.
                </p>
            </section>

            <div className="rounded-xl border border-line bg-surface p-5 shadow-raised sm:p-6">
                <button
                    type="submit"
                    className="form-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting}
                >
                    {submitting
                        ? "Submitting registration..."
                        : "Register business"}
                </button>
            </div>
        </form>
    );
}

function SectionHeading({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                {icon}
            </span>

            <div>
                <h2 className="font-semibold text-ink">
                    {title}
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    type = "text",
    value,
    placeholder,
    onChange,
}: {
    id: keyof VendorForm;
    label: string;
    type?: string;
    value: string;
    placeholder: string;
    onChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-ink"
            >
                {label}
                <span
                    className="ml-1 text-error-ink"
                    aria-hidden="true"
                >
                    *
                </span>
            </label>

            <input
                id={id}
                name={id}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className="form-input mb-0"
                autoComplete={
                    type === "email"
                        ? "email"
                        : type === "tel"
                          ? "tel"
                          : "off"
                }
                required
            />
        </div>
    );
}