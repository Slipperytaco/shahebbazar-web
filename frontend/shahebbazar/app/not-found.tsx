import Link from "next/link";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";

// Reached by notFound() and by any unrouted URL. It keeps the site chrome so
// someone arriving from a search engine can still get into the directory.
// The locale is not readable here, so the copy is given in both languages.
export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader locale="en" />

            <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-[0.8125rem] font-medium tracking-wide text-brand-600 uppercase">
                    404
                </p>
                <h1 className="mt-2 text-[1.75rem] leading-tight font-bold tracking-tight">
                    Page not found
                </h1>
                <p className="mt-2 text-[0.9375rem] text-muted">
                    This page does not exist, or the business has been removed
                    from the directory.
                </p>
                <p className="mt-1 text-[0.9375rem] text-muted" lang="bn">
                    এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                    >
                        <Search className="size-4" />
                        Browse businesses
                    </Link>
                    <Link
                        href="/categories"
                        className="inline-flex items-center justify-center rounded-[10px] border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-600 hover:text-brand-600"
                    >
                        All categories
                    </Link>
                </div>
            </main>

            <SiteFooter locale="en" />
        </div>
    );
}
