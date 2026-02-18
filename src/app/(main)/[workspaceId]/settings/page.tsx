import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import {
  getWorkspaceById,
  getWorkspaceMembers,
  getMemberRole,
} from "@/services/workspace.service";
import { SettingsContent } from "./settings-content";

interface SettingsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace) redirect("/");

  const role = await getMemberRole(workspaceId, user.id);
  if (!role) redirect("/");

  const members = await getWorkspaceMembers(workspaceId);
  const isOwner = role === "owner";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Workspace Settings</h1>
      <SettingsContent
        workspace={workspace}
        members={members}
        isOwner={isOwner}
        currentUserId={user.id}
      />
    </div>
  );
}
