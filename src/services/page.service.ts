import { createClient } from "@/lib/supabase/server";
import type { Page, PageInsert, PageUpdate } from "@/types";

export async function getPagesForWorkspace(
  workspaceId: string,
): Promise<Page[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .order("position", { ascending: true });

  return (data as Page[]) ?? [];
}

export async function getPageById(pageId: string): Promise<Page | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  return data as Page | null;
}

export async function getChildPages(parentId: string): Promise<Page[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_archived", false)
    .order("position", { ascending: true });

  return (data as Page[]) ?? [];
}

export async function createPage(
  page: Omit<PageInsert, "is_archived" | "is_published" | "position">,
): Promise<Page | null> {
  const supabase = await createClient();

  // Get the next position
  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", page.workspace_id)
    .eq("is_archived", false);

  const { data } = await supabase
    .from("pages")
    .insert({
      ...page,
      is_archived: false,
      is_published: false,
      position: count ?? 0,
    } as Record<string, unknown>)
    .select()
    .single();

  return data as Page | null;
}

export async function updatePage(
  pageId: string,
  updates: PageUpdate,
): Promise<Page | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .update(updates as Record<string, unknown>)
    .eq("id", pageId)
    .select()
    .single();

  return data as Page | null;
}

export async function archivePage(pageId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pages")
    .update({ is_archived: true } as Record<string, unknown>)
    .eq("id", pageId);

  return !error;
}

export async function restorePage(pageId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pages")
    .update({ is_archived: false } as Record<string, unknown>)
    .eq("id", pageId);

  return !error;
}

export async function deletePage(pageId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  return !error;
}

export async function searchPages(
  workspaceId: string,
  query: string,
): Promise<Page[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", false)
    .ilike("title", `%${query}%`)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (data as Page[]) ?? [];
}

export async function getArchivedPages(workspaceId: string): Promise<Page[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("is_archived", true)
    .order("updated_at", { ascending: false });

  return (data as Page[]) ?? [];
}
