import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceMember } from "@/types";

export async function getWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId);

  if (!memberships || memberships.length === 0) return [];

  const workspaceIds = memberships.map(
    (m: Record<string, unknown>) => m.workspace_id as string,
  );

  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)
    .order("created_at", { ascending: true });

  return (data as Workspace[]) ?? [];
}

export async function getWorkspaceById(
  workspaceId: string,
): Promise<Workspace | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  return data as Workspace | null;
}

export async function createWorkspace(
  name: string,
  ownerId: string,
): Promise<Workspace | null> {
  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name, owner_id: ownerId } as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    console.error("createWorkspace insert error:", error.message);
    return null;
  }

  if (!workspace) return null;

  // Add owner as a member
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: (workspace as Record<string, unknown>).id,
      user_id: ownerId,
      role: "owner",
    } as Record<string, unknown>);

  if (memberError) {
    console.error("createWorkspace member insert error:", memberError.message);
  }

  return workspace as Workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  updates: { name?: string; icon?: string },
): Promise<Workspace | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspaces")
    .update(updates as Record<string, unknown>)
    .eq("id", workspaceId)
    .select()
    .single();

  return data as Workspace | null;
}

export async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  return !error;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<
  (WorkspaceMember & {
    profile: {
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  })[]
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_members")
    .select(
      `
      *,
      profile:profiles(email, full_name, avatar_url)
    `,
    )
    .eq("workspace_id", workspaceId);

  return (data ?? []) as (WorkspaceMember & {
    profile: {
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  })[];
}

export async function getMemberRole(
  workspaceId: string,
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  return (data as Record<string, unknown> | null)?.role as string | null;
}

export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: "editor" | "viewer",
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspaceId, user_id: userId, role } as Record<
      string,
      unknown
    >);

  return !error;
}

export async function removeWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  return !error;
}
