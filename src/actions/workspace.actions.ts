"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as workspaceService from "@/services/workspace.service";
import { getCurrentUser } from "@/services/auth.service";
import type { ActionResponse, Workspace } from "@/types";

export async function createWorkspaceAction(
  formData: FormData,
): Promise<ActionResponse<Workspace>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return { success: false, error: "Workspace name is required" };
  }

  const workspace = await workspaceService.createWorkspace(
    name.trim(),
    user.id,
  );

  if (!workspace) {
    return { success: false, error: "Failed to create workspace" };
  }

  revalidatePath("/");
  redirect(`/${workspace.id}`);
}

export async function updateWorkspaceAction(
  workspaceId: string,
  formData: FormData,
): Promise<ActionResponse<Workspace>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string | null;

  const workspace = await workspaceService.updateWorkspace(workspaceId, {
    ...(name && { name: name.trim() }),
    ...(icon && { icon }),
  });

  if (!workspace) {
    return { success: false, error: "Failed to update workspace" };
  }

  revalidatePath(`/${workspaceId}`);
  return { success: true, data: workspace };
}

export async function deleteWorkspaceAction(
  workspaceId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await workspaceService.deleteWorkspace(workspaceId);

  if (!success) {
    return { success: false, error: "Failed to delete workspace" };
  }

  revalidatePath("/");
  redirect("/");
}

export async function inviteMemberAction(
  workspaceId: string,
  formData: FormData,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const role = await workspaceService.getMemberRole(workspaceId, user.id);
  if (role !== "owner") {
    return { success: false, error: "Only owners can invite members" };
  }

  const email = formData.get("email") as string;
  const memberRole = (formData.get("role") as "editor" | "viewer") || "viewer";

  if (!email) return { success: false, error: "Email is required" };

  // Find user by email — import supabase directly for this
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!profile) {
    return { success: false, error: "User not found" };
  }

  const profileId = (profile as Record<string, unknown>).id as string;

  const success = await workspaceService.addWorkspaceMember(
    workspaceId,
    profileId,
    memberRole,
  );

  if (!success) {
    return { success: false, error: "Failed to add member" };
  }

  revalidatePath(`/${workspaceId}/settings`);
  return { success: true };
}

export async function removeMemberAction(
  workspaceId: string,
  userId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const role = await workspaceService.getMemberRole(workspaceId, user.id);
  if (role !== "owner") {
    return { success: false, error: "Only owners can remove members" };
  }

  const success = await workspaceService.removeWorkspaceMember(
    workspaceId,
    userId,
  );

  if (!success) {
    return { success: false, error: "Failed to remove member" };
  }

  revalidatePath(`/${workspaceId}/settings`);
  return { success: true };
}
