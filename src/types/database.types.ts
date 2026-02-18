/* =============================================================
   Database Types — mirrors the Supabase schema exactly.
   Generated manually; replace with `supabase gen types` in CI.
   ============================================================= */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      workspaces: {
        Row: Workspace;
        Insert: WorkspaceInsert;
        Update: WorkspaceUpdate;
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: WorkspaceMemberInsert;
        Update: WorkspaceMemberUpdate;
      };
      pages: {
        Row: Page;
        Insert: PageInsert;
        Update: PageUpdate;
      };
      page_shares: {
        Row: PageShare;
        Insert: PageShareInsert;
        Update: PageShareUpdate;
      };
    };
  };
}

/* ---------- Profiles ---------- */
export interface Profile {
  id: string; // references auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

/* ---------- Workspaces ---------- */
export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type WorkspaceInsert = Omit<
  Workspace,
  "id" | "created_at" | "updated_at"
>;
export type WorkspaceUpdate = Partial<
  Omit<Workspace, "id" | "owner_id" | "created_at">
>;

/* ---------- Workspace Members ---------- */
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
}

export type WorkspaceMemberInsert = Omit<WorkspaceMember, "id" | "created_at">;
export type WorkspaceMemberUpdate = Pick<WorkspaceMember, "role">;

/* ---------- Pages ---------- */
export interface Page {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  title: string;
  content: Record<string, unknown> | null; // TipTap JSON
  icon: string | null;
  cover_image: string | null;
  is_archived: boolean;
  is_published: boolean;
  created_by: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export type PageInsert = Omit<Page, "id" | "created_at" | "updated_at">;
export type PageUpdate = Partial<
  Omit<Page, "id" | "workspace_id" | "created_by" | "created_at">
>;

/* ---------- Page Shares ---------- */
export interface PageShare {
  id: string;
  page_id: string;
  shared_with_email: string;
  shared_with_user_id: string | null;
  role: "editor" | "viewer";
  created_at: string;
}

export type PageShareInsert = Omit<PageShare, "id" | "created_at">;
export type PageShareUpdate = Pick<PageShare, "role">;
