import { notFound } from "next/navigation";
import { getPageById } from "@/services/page.service";
import { PageTitle } from "@/components/pages/page-title";
import { IconPicker } from "@/components/pages/icon-picker";
import { BlockEditor } from "@/components/editor/block-editor";
import { siteConfig } from "@/config/site";
import Link from "next/link";

interface SharedPageProps {
  params: Promise<{ pageId: string }>;
}

export default async function SharedPage({ params }: SharedPageProps) {
  const { pageId } = await params;

  const page = await getPageById(pageId);

  if (!page || !page.is_published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              N
            </div>
            <span className="font-semibold">{siteConfig.name}</span>
          </Link>
          <span className="text-xs text-muted-foreground">Published page</span>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-10 md:px-16 lg:px-24">
        <div className="mb-4">
          <IconPicker page={page} editable={false} />
        </div>

        <div className="mb-6">
          <PageTitle page={page} editable={false} />
        </div>

        <BlockEditor page={page} editable={false} />
      </div>
    </div>
  );
}
