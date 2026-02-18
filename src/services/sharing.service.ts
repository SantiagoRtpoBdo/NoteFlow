import { createClient } from "@/lib/supabase/server";
import type { PageShare } from "@/types";

export async function getSharesForPage(pageId: string): Promise<PageShare[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("page_shares")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });

  return (data as PageShare[]) ?? [];
}

export async function sharePage(
  pageId: string,
  email: string,
  role: "editor" | "viewer",
): Promise<PageShare | null> {
  const supabase = await createClient();

  // Try to find the user by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  const profileId = (profile as Record<string, unknown> | null)?.id as
    | string
    | null;

  const { data } = await supabase
    .from("page_shares")
    .insert({
      page_id: pageId,
      shared_with_email: email,
      shared_with_user_id: profileId ?? null,
      role,
    } as Record<string, unknown>)
    .select()
    .single();

  return data as PageShare | null;
}

export async function updateShareRole(
  shareId: string,
  role: "editor" | "viewer",
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("page_shares")
    .update({ role } as Record<string, unknown>)
    .eq("id", shareId);

  return !error;
}

export async function removeShare(shareId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("page_shares")
    .delete()
    .eq("id", shareId);

  return !error;
}

export async function getSharedPagesForUser(
  userId: string,
): Promise<PageShare[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("page_shares")
    .select("*")
    .eq("shared_with_user_id", userId);

  return (data as PageShare[]) ?? [];
}
