"use server";

import { revalidatePath } from "next/cache";
import { saveVendorProfile } from "@/lib/api";
import type { SaveProfileResult, VendorProfileInput } from "@/lib/types";

// Saves the Add / Edit Business form, then refreshes every cached page that shows the business.
export async function saveBusinessProfile(
    vendorId: number,
    input: VendorProfileInput
): Promise<SaveProfileResult> {
    // TODO(auth): verify the signed-in user owns vendorId.

    if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
        return { ok: false, error: "Invalid vendor id" };
    }
    if (!input || typeof input !== "object") {
        return { ok: false, error: "Invalid form data" };
    }

    const result = await saveVendorProfile(vendorId, input);
    if (result.ok) revalidatePath("/", "layout");
    return result;
}

// Uploads go straight from the browser to the API, so cached pages are refreshed separately afterwards.
export async function refreshPublicPages(): Promise<void> {
    revalidatePath("/", "layout");
}
