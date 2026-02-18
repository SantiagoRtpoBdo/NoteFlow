import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageAction } from "@/actions/page.actions";
import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  async function handleCreatePage() {
    "use server";
    const result = await createPageAction(workspaceId);
    if (result.success && result.data) {
      redirect(`/${workspaceId}/${result.data.id}`);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to your workspace</h2>
        <p className="text-muted-foreground max-w-sm">
          Select a page from the sidebar or create a new one to get started.
        </p>
      </div>

      <form action={handleCreatePage}>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create a page
        </Button>
      </form>
    </div>
  );
}
