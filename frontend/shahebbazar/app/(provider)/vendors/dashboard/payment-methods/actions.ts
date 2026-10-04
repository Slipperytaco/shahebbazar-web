"use server";

import { revalidatePath } from "next/cache";
import { saveVendorPaymentMethods, type SavePaymentMethodsResult } from "@/lib/api";
import type { PaymentMethod } from "@/lib/types";

export async function savePaymentMethods(
    vendorId: number,
    methods: PaymentMethod[]
): Promise<SavePaymentMethodsResult> {
    // TODO(auth): verify the signed-in user owns vendorId.

    if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
        return { ok: false, error: "Invalid vendor id" };
    }
    if (!Array.isArray(methods)) {
        return { ok: false, error: "Invalid payment methods" };
    }

    const result = await saveVendorPaymentMethods(vendorId, methods);

    // Refresh cached business profiles so the change shows immediately.
    if (result.ok) {
        revalidatePath("/(public)/business/[slug]", "page");
    }

    return result;
}
