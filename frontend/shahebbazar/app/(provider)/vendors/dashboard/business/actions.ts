"use server";

import { revalidatePath } from "next/cache";
import { authenticatedApiSend } from "@/lib/auth-server";
import type {
  SaveProfileResult,
  VendorProfile,
  VendorProfileInput,
} from "@/lib/types";

export async function saveBusinessProfile(
  vendorId: number,
  input: VendorProfileInput
): Promise<SaveProfileResult> {
  if (!Number.isSafeInteger(vendorId) || vendorId <= 0) {
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

  const result = await authenticatedApiSend<VendorProfile>(
    "PUT",
    `/vendors/${vendorId}/profile`,
    input
  );

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      errors: result.errors,
    };
  }

  revalidatePath(`/vendors/dashboard/business?vendor=${vendorId}`);
  revalidatePath(`/vendors/dashboard?vendor=${vendorId}`);
  revalidatePath("/", "layout");

  return {
    ok: true,
    profile: result.data,
  };
}

export async function refreshPublicPages(): Promise<void> {
  revalidatePath("/", "layout");
}