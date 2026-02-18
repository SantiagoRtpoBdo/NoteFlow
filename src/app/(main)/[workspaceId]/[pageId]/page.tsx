import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import { getPageById } from "@/services/page.service";
import { getMemberRole } from "@/services/workspace.service";
import { getSharesForPage } from "@/services/sharing.service";
import { PageHeader } from "@/components/pages/page-header";
import { PageTitle } from "@/components/pages/page-title";
import { IconPicker } from "@/components/pages/icon-picker";
import { BlockEditor } from "@/components/editor/block-editor";
import { ErrorBoundary } from "@/components/shared/error-boundary";

interface PageViewProps {
  params: Promise<{ workspaceId: string; pageId: string }>;
}

export default async function PageView({ params }: PageViewProps) {
  const { workspaceId, pageId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const page = await getPageById(pageId);
  if (!page || page.workspace_id !== workspaceId) notFound();

  const role = await getMemberRole(workspaceId, user.id);
  const canEdit = role === "owner" || role === "editor";
  const shares = await getSharesForPage(pageId);

  return (
    <div className="flex h-full flex-col">
      <PageHeader page={page} shares={shares} canEdit={canEdit} />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-16 lg:px-24">
          {/* Icon */}
          <div className="mb-4">
            <IconPicker page={page} editable={canEdit} />
          </div>

          {/* Title */}
          <div className="mb-6">
            <PageTitle page={page} editable={canEdit} />
          </div>

          {/* Editor — key forces remount on page change to avoid DOM mismatch */}
          <ErrorBoundary>
            <BlockEditor key={page.id} page={page} editable={canEdit} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
