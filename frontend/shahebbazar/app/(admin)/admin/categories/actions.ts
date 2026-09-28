"use server";

import { revalidatePath } from "next/cache";
import { apiSend, type SendResult } from "@/lib/api";
import type { CategoryInput } from "@/lib/types";

// TODO(auth): verify the signed-in user is an admin in both actions.

// Adds a main category, or a subcategory when parentId is given.
export async function createCategory(parentId: number | null, input: CategoryInput): Promise<SendResult> {
    const result = await apiSend("POST", "/admin/categories", { ...input, parent_id: parentId });
    if (result.ok) revalidatePath("/", "layout");
    return result;
}

// Saves a category's names, icon, order and visibility.
export async function updateCategory(id: number, input: CategoryInput, isActive: boolean): Promise<SendResult> {
    const result = await apiSend("PUT", `/admin/categories/${id}`, { ...input, is_active: isActive });
    if (result.ok) revalidatePath("/", "layout");
    return result;
}
