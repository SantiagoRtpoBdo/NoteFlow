"use server";

import { revalidatePath } from "next/cache";
import * as pageService from "@/services/page.service";
import { getCurrentUser } from "@/services/auth.service";
import type { ActionResponse, Page, PageUpdate } from "@/types";

export async function createPageAction(
  workspaceId: string,
  parentId?: string | null,
): Promise<ActionResponse<Page>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const page = await pageService.createPage({
    workspace_id: workspaceId,
    parent_id: parentId ?? null,
    title: "Untitled",
    content: null,
    icon: "📄",
    cover_image: null,
    created_by: user.id,
  });

  if (!page) {
    return { success: false, error: "Failed to create page" };
  }

  revalidatePath(`/${workspaceId}`);
  return { success: true, data: page };
}

export async function updatePageAction(
  pageId: string,
  updates: PageUpdate,
): Promise<ActionResponse<Page>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const page = await pageService.updatePage(pageId, updates);

  if (!page) {
    return { success: false, error: "Failed to update page" };
  }

  // Don't revalidate on content updates (auto-save) to avoid flicker
  if (updates.title || updates.icon || updates.is_archived !== undefined) {
    revalidatePath(`/${page.workspace_id}`);
  }

  return { success: true, data: page };
}

export async function archivePageAction(
  pageId: string,
  workspaceId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await pageService.archivePage(pageId);

  if (!success) {
    return { success: false, error: "Failed to archive page" };
  }

  revalidatePath(`/${workspaceId}`);
  return { success: true };
}

export async function restorePageAction(
  pageId: string,
  workspaceId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await pageService.restorePage(pageId);

  if (!success) {
    return { success: false, error: "Failed to restore page" };
  }

  revalidatePath(`/${workspaceId}`);
  return { success: true };
}

export async function deletePageAction(
  pageId: string,
  workspaceId: string,
): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const success = await pageService.deletePage(pageId);

  if (!success) {
    return { success: false, error: "Failed to delete page" };
  }

  revalidatePath(`/${workspaceId}`);
  return { success: true };
}

export async function searchPagesAction(
  workspaceId: string,
  query: string,
): Promise<ActionResponse<Page[]>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const pages = await pageService.searchPages(workspaceId, query);
  return { success: true, data: pages };
}
