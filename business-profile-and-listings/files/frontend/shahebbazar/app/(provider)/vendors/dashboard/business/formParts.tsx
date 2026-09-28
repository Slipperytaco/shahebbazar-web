"use client";

import { AlertCircle } from "lucide-react";

/** Building blocks shared by the sections of the business form. */

export const inputClass =
    "h-11 w-full rounded-[10px] border bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-soft focus:border-brand-500 focus:ring-3 focus:ring-brand-100 disabled:bg-surface-2 disabled:text-muted";

/** Border colour for a field, red when it has an error. */
export function borderFor(error?: string) {
    return error ? "border-error-ink" : "border-line-strong";
}

export function Section({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-heading`}
            className="scroll-mt-24 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6"
        >
            <h2 id={`${id}-heading`} className="text-[1.0625rem] font-semibold tracking-tight">
                {title}
            </h2>
            {description && <p className="mt-1 text-[0.8125rem] text-muted">{description}</p>}
            <div className="mt-5">{children}</div>
        </section>
    );
}

export function Field({
    id,
    label,
    required,
    hint,
    error,
    counter,
    className = "",
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    counter?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-medium">
                {label}
                {required && (
                    <span className="text-error-ink" aria-hidden>
                        {" "}
                        *
                    </span>
                )}
            </label>
            {children}
            <div className="mt-1 flex items-start justify-between gap-3 text-[0.75rem]">
                {error ? (
                    <p id={`${id}-error`} className="flex items-start gap-1 text-error-ink">
                        <AlertCircle className="mt-px size-3.5 shrink-0" />
                        {error}
                    </p>
                ) : hint ? (
                    <p id={`${id}-hint`} className="text-muted">
                        {hint}
                    </p>
                ) : (
                    <span />
                )}
                {counter && <span className="shrink-0 text-muted tabular-nums">{counter}</span>}
            </div>
        </div>
    );
}

// aria attributes linking a control to its error, or otherwise to its hint.
export function describedBy(id: string, error?: string, hasHint = false) {
    return {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
    } as const;
}
