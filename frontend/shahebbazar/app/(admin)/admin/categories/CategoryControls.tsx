"use client";

import { createElement, useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus } from "lucide-react";
import { CATEGORY_ICON_NAMES, categoryIcon } from "@/components/shared/icons";
import type { AdminCategory, CategoryInput } from "@/lib/types";
import { createCategory, updateCategory } from "./actions";

const INPUT =
    "mt-1 w-full rounded-[10px] border border-line-strong bg-surface px-3 py-2 text-sm font-normal outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100";

// Shared fields for adding and editing a category.
function Fields({ value, onChange, withIcon }: { value: CategoryInput; onChange: (v: CategoryInput) => void; withIcon: boolean }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[0.8125rem] font-semibold">
                English name
                <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} maxLength={100} required className={INPUT} />
            </label>
            <label className="text-[0.8125rem] font-semibold">
                Bangla name
                <input value={value.name_bn} onChange={(e) => onChange({ ...value, name_bn: e.target.value })} maxLength={100} lang="bn" className={INPUT} />
            </label>
            {withIcon && (
                <label className="text-[0.8125rem] font-semibold">
                    Icon
                    <select value={value.icon} onChange={(e) => onChange({ ...value, icon: e.target.value })} className={INPUT}>
                        <option value="">Default</option>
                        {CATEGORY_ICON_NAMES.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
            )}
            <label className="text-[0.8125rem] font-semibold">
                Order <span className="font-normal text-muted">(lower shows first)</span>
                <input
                    type="number"
                    min={0}
                    max={9999}
                    value={value.sort_order}
                    onChange={(e) => onChange({ ...value, sort_order: Number(e.target.value) })}
                    className={INPUT}
                />
            </label>
        </div>
    );
}

// Collapsed "Add" button that opens a form for a new main category or subcategory.
export function AddCategory({ parentId, label }: { parentId: number | null; label: string }) {
    const empty: CategoryInput = { name: "", name_bn: "", icon: "", sort_order: 0 };
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(empty);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await createCategory(parentId, value);
            if (!result.ok) return setError(result.error);
            setValue(empty);
            setOpen(false);
        });
    }

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                <Plus className="size-4" /> {label}
            </button>
        );
    }

    return (
        <form onSubmit={submit} className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
            <p className="mb-3 text-sm font-semibold">{label}</p>
            <Fields value={value} onChange={setValue} withIcon={parentId === null} />
            {error && <p role="alert" className="mt-2 text-[0.8125rem] text-error-ink">{error}</p>}
            <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-[10px] border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium hover:bg-surface-2">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={pending || value.name.trim().length < 2}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                    {pending && <Loader2 className="size-4 animate-spin" />} Add
                </button>
            </div>
        </form>
    );
}

// One category row: shows its details, edits them in place, and hides or shows it.
export function CategoryRow({ category, parentHidden = false }: { category: AdminCategory; parentHidden?: boolean }) {
    const saved: CategoryInput = {
        name: category.name,
        name_bn: category.name_bn ?? "",
        icon: category.icon ?? "",
        sort_order: category.sort_order,
    };
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(saved);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const isMain = category.parent_id === null;

    function save(input: CategoryInput, isActive: boolean) {
        setError(null);
        startTransition(async () => {
            const result = await updateCategory(category.id, input, isActive);
            if (!result.ok) return setError(result.error);
            setEditing(false);
        });
    }

    if (editing) {
        return (
            <div className="rounded-xl border border-line bg-surface-2 p-4">
                <Fields value={value} onChange={setValue} withIcon={isMain} />
                <p className="mt-2 text-xs text-soft">Web address stays /categories/{category.slug} so existing links keep working.</p>
                {error && <p role="alert" className="mt-2 text-[0.8125rem] text-error-ink">{error}</p>}
                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setValue(saved);
                            setEditing(false);
                        }}
                        className="rounded-[10px] border border-line-strong bg-surface px-3.5 py-1.5 text-sm font-medium hover:bg-surface-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={pending || value.name.trim().length < 2}
                        onClick={() => save(value, category.is_active)}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                        {pending && <Loader2 className="size-4 animate-spin" />} Save
                    </button>
                </div>
            </div>
        );
    }

    const visible = category.is_active && !parentHidden;

    return (
        <div className={`flex flex-wrap items-center gap-3 ${visible ? "" : "opacity-60"}`}>
            {isMain && (
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    {createElement(categoryIcon(category.icon), { className: "size-4" })}
                </span>
            )}
            <span className="min-w-0 flex-1">
                <span className={`block ${isMain ? "font-semibold" : "text-sm font-medium"}`}>
                    {category.name}
                    {category.name_bn && <span lang="bn" className="ml-2 font-normal text-muted">{category.name_bn}</span>}
                </span>
                <span className="block text-xs text-soft">
                    /categories/{category.slug} · {category.business_count} business{category.business_count === 1 ? "" : "es"} · order{" "}
                    {category.sort_order}
                    {!category.is_active && " · hidden"}
                    {category.is_active && parentHidden && " · hidden with its main category"}
                </span>
                {error && <span role="alert" className="block text-[0.8125rem] text-error-ink">{error}</span>}
            </span>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-medium text-brand-600 hover:bg-brand-50">
                <Pencil className="size-3.5" /> Edit
            </button>
            <button
                type="button"
                disabled={pending}
                onClick={() => save(saved, !category.is_active)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-medium text-muted hover:bg-surface-2 hover:text-ink disabled:opacity-50"
            >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : category.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {category.is_active ? "Hide" : "Show"}
            </button>
        </div>
    );
}
