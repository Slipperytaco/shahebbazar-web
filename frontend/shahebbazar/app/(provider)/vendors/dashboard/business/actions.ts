"use server";

import { revalidatePath } from "next/cache";
import {
    authenticatedApiSend,
} from "@/lib/auth-server";
import type {
    SaveProfileResult,
    VendorProfile,
    VendorProfileInput,
} from "@/lib/types";

type ProfileResponse = VendorProfile;

export async function saveBusinessProfile(
    vendorId: number,
    input: VendorProfileInput
): Promise<SaveProfileResult> {
    if (
        !Number.isSafeInteger(vendorId) ||
        vendorId <= 0
    ) {
        return {
            ok: false,
            error: "Invalid vendor id",
        };
    }

    if (!input || typeof input !== "object") {
        return {
            ok: false,
            error: "Invalid form data",
        };
    }

    const result =
        await authenticatedApiSend<ProfileResponse>(
            "PUT",
            `/vendors/${vendorId}/profile`,
            input
        );

    if (!result.ok) {
        return {
            ok: false,
            error: result.error,
        };
    }

    revalidatePath(
        `/vendors/dashboard/business`
    );
    revalidatePath(
        `/vendors/dashboard?vendor=${vendorId}`
    );
    revalidatePath("/", "layout");

    return {
        ok: true,
        profile: result.data,
    };
}

export async function refreshPublicPages(): Promise<void> {
    revalidatePath("/", "layout");
}