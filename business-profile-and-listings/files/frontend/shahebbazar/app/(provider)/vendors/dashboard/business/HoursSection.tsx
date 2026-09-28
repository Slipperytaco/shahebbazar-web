"use client";

import { Copy } from "lucide-react";
import type { HoursMode } from "@/lib/types";
import { inputClass, borderFor } from "./formParts";

export type DayHours = { mode: HoursMode | "unset"; open: string; close: string };

/** 0 = Sunday, matching PostgreSQL EXTRACT(DOW) and the database rows. */
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MODES: { value: DayHours["mode"]; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "24h", label: "Open 24 hours" },
    { value: "unset", label: "Not set" },
];

export function HoursSection({
    hours,
    errors,
    onChange,
}: {
    hours: DayHours[];
    errors: Record<string, string>;
    onChange: (hours: DayHours[]) => void;
}) {
    const setDay = (day: number, patch: Partial<DayHours>) =>
        onChange(hours.map((h, i) => (i === day ? { ...h, ...patch } : h)));

    const copyFirstToAll = () => onChange(hours.map(() => ({ ...hours[0] })));

    return (
        <div>
            <ul className="divide-y divide-line">
                {hours.map((h, day) => {
                    const error = errors[`hours.${day}`];
                    const id = `hours-${day}`;
                    return (
                        <li key={day} className="py-3 first:pt-0">
                            <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 sm:grid-cols-[110px_170px_minmax(0,1fr)]">
                                <label htmlFor={`${id}-mode`} className="text-sm font-medium">
                                    {DAY_NAMES[day]}
                                </label>
                                <select
                                    id={`${id}-mode`}
                                    value={h.mode}
                                    onChange={(e) =>
                                        setDay(day, {
                                            mode: e.target.value as DayHours["mode"],
                                            // Sensible times the first time a day is opened.
                                            ...(e.target.value === "open" && !h.open && !h.close
                                                ? { open: "09:00", close: "18:00" }
                                                : {}),
                                        })
                                    }
                                    className={`${inputClass} ${borderFor(error)}`}
                                    aria-invalid={error ? true : undefined}
                                    aria-describedby={error ? `${id}-error` : undefined}
                                >
                                    {MODES.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>

                                {h.mode === "open" ? (
                                    <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                                        <input
                                            type="time"
                                            aria-label={`${DAY_NAMES[day]} opens`}
                                            value={h.open}
                                            step={900}
                                            onChange={(e) => setDay(day, { open: e.target.value })}
                                            className={`${inputClass} ${borderFor(error)} max-w-[150px]`}
                                        />
                                        <span className="text-sm text-muted">to</span>
                                        <input
                                            type="time"
                                            aria-label={`${DAY_NAMES[day]} closes`}
                                            value={h.close}
                                            step={900}
                                            onChange={(e) => setDay(day, { close: e.target.value })}
                                            className={`${inputClass} ${borderFor(error)} max-w-[150px]`}
                                        />
                                    </div>
                                ) : (
                                    <p className="col-span-2 text-[0.8125rem] text-muted sm:col-span-1">
                                        {h.mode === "unset"
                                            ? "Shown as “hours not listed”"
                                            : h.mode === "closed"
                                              ? "Closed all day"
                                              : "Open all day and night"}
                                    </p>
                                )}
                            </div>
                            {error && (
                                <p id={`${id}-error`} className="mt-1.5 text-[0.75rem] text-error-ink">
                                    {error}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                onClick={copyFirstToAll}
                className="mt-3 inline-flex items-center gap-2 rounded-[10px] border border-line-strong px-3.5 py-2 text-[0.8125rem] font-medium text-brand-600 hover:border-brand-600 hover:bg-brand-50"
            >
                <Copy className="size-4" /> Copy Sunday&rsquo;s hours to every day
            </button>
            {errors.hours && <p className="mt-2 text-[0.75rem] text-error-ink">{errors.hours}</p>}
        </div>
    );
}
