import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import { getWorkspaceById, getMemberRole } from "@/services/workspace.service";
import { getPagesForWorkspace } from "@/services/page.service";
import { Sidebar } from "@/components/layout/sidebar";
import type { AuthUser } from "@/types";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) redirect("/");

  const role = await getMemberRole(workspaceId, user.id);
  if (!role) redirect("/");

  const pages = await getPagesForWorkspace(workspaceId);

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={authUser} workspace={workspace} pages={pages} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
