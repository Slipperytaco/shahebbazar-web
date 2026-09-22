import { ShieldCheck, Wallet } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { PAYMENT_COPY, paymentMethodOption } from "@/lib/paymentMethods";
import type { PaymentMethod } from "@/lib/types";

export function PaymentMethodsCard({
    locale,
    methods,
}: {
    locale: Locale;
    methods: PaymentMethod[];
}) {
    const copy = PAYMENT_COPY[locale];

    // Skip methods this build has no label for.
    const known = methods.flatMap((method) => {
        const option = paymentMethodOption(method.payment_method);
        return option ? [{ ...method, option }] : [];
    });

    return (
        <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-[1.0625rem] font-semibold tracking-tight">
                <Wallet className="size-[18px] text-muted" />
                {copy.heading}
            </h2>

            {known.length === 0 ? (
                <p className="mt-3 text-[0.8125rem] text-muted">{copy.notListed}</p>
            ) : (
                <ul className="mt-3.5 space-y-2.5">
                    {known.map(({ payment_method, payment_note, option }) => {
                        const Icon = option.icon;
                        return (
                            <li key={payment_method} className="flex items-start gap-2.5">
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                    <Icon className="size-4" />
                                </span>
                                <span className="min-w-0 pt-0.5">
                                    <span className="block text-[0.875rem] font-medium">
                                        {pick(locale, option.label, option.label_bn)}
                                    </span>
                                    {payment_note && (
                                        <span className="block text-[0.8125rem] text-muted">
                                            {payment_note}
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="mt-4 flex items-start gap-2 border-t border-line pt-3.5 text-[0.75rem] leading-snug text-muted">
                <ShieldCheck className="mt-px size-3.5 shrink-0" />
                {copy.payDirectly}
            </p>
        </section>
    );
}
