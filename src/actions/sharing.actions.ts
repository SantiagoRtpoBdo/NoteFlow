"use server";

import { revalidatePath } from "next/cache";
import * as sharingService from "@/services/sharing.service";
import { getCurrentUser } from "@/services/auth.service";
import { getPageById } from "@/services/page.service";
import type { ActionResponse, PageShare } from "@/types";

export async function sharePageAction(
  pageId: string,
  formData: FormData,
): Promise<ActionResponse<PageShare>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const email = formData.get("email") as string;
  const role = (formData.get("role") as "editor" | "viewer") || "viewer";

  if (!email) return { success: false, error: "Email is required" };
  if (email === user.email) {
    return { success: false, error: "Cannot share with yourself" };
  }

  const share = await sharingService.sharePage(pageId, email, role);

  if (!share) {
    return { success: false, error: "Failed to share page" };
  }

  const page = await getPageById(pageId);
  if (page) {
    revalidatePath(`/${page.workspace_id}/${pageId}`);
  }

  return { success: true, data: share };
}

export async function updateShareRoleAction(
  shareId: string,
  role: "editor" | "viewer",
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await sharingService.updateShareRole(shareId, role);

  if (!success) {
    return { success: false, error: "Failed to update share role" };
  }

  return { success: true };
}

export async function removeShareAction(
  shareId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await sharingService.removeShare(shareId);

  if (!success) {
    return { success: false, error: "Failed to remove share" };
  }

  return { success: true };
}
