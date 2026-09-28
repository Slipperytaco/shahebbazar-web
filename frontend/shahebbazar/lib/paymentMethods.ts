import { Banknote, CreditCard, Landmark, Smartphone, Truck, type LucideIcon } from "lucide-react";
import type { Locale } from "./i18n";
import type { PaymentMethodKey } from "./types";

export interface PaymentMethodOption {
    key: PaymentMethodKey;
    label: string;
    label_bn: string;
    icon: LucideIcon;
}

// "Cash" is ক্যাশ, not নগদ, which reads as the Nagad brand.
export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
    { key: "cash", label: "Cash", label_bn: "ক্যাশ", icon: Banknote },
    { key: "cash_on_delivery", label: "Cash on delivery", label_bn: "ক্যাশ অন ডেলিভারি", icon: Truck },
    { key: "bank_transfer", label: "Bank transfer", label_bn: "ব্যাংক ট্রান্সফার", icon: Landmark },
    { key: "bkash", label: "bKash", label_bn: "বিকাশ", icon: Smartphone },
    { key: "nagad", label: "Nagad", label_bn: "নগদ", icon: Smartphone },
    { key: "rocket", label: "Rocket", label_bn: "রকেট", icon: Smartphone },
    { key: "card", label: "Card (in person)", label_bn: "কার্ড (সরাসরি)", icon: CreditCard },
];

const BY_KEY = new Map(PAYMENT_METHOD_OPTIONS.map((option) => [option.key, option]));

export function paymentMethodOption(key: string): PaymentMethodOption | undefined {
    return BY_KEY.get(key as PaymentMethodKey);
}

export const PAYMENT_NOTE_MAX_LENGTH = 120;

export const PAYMENT_COPY: Record<
    Locale,
    { heading: string; notListed: string; payDirectly: string }
> = {
    en: {
        heading: "Payment methods",
        notListed: "This business has not listed its payment methods. Ask when you contact them.",
        payDirectly:
            "You pay the business directly. Shahebbazar does not take or handle payments.",
    },
    bn: {
        heading: "পেমেন্ট পদ্ধতি",
        notListed: "এই প্রতিষ্ঠান পেমেন্ট পদ্ধতি উল্লেখ করেনি। যোগাযোগের সময় জেনে নিন।",
        payDirectly:
            "আপনি সরাসরি প্রতিষ্ঠানকে পরিশোধ করবেন। সাহেববাজার কোনো পেমেন্ট গ্রহণ বা পরিচালনা করে না।",
    },
};
