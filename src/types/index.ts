export type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Workspace,
  WorkspaceInsert,
  WorkspaceUpdate,
  WorkspaceMember,
  WorkspaceMemberInsert,
  WorkspaceMemberUpdate,
  Page,
  PageInsert,
  PageUpdate,
  PageShare,
  PageShareInsert,
  PageShareUpdate,
} from "./database.types";

/** Sidebar tree node (computed, not stored) */
export interface PageNode {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: number;
  children: PageNode[];
}

/** Auth user for client-side usage */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/** Server action standardised response */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
