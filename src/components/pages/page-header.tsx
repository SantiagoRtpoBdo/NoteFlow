"use client";

import { formatDistanceToNow } from "date-fns";
import { SaveIndicator } from "@/components/layout/save-indicator";
import { ShareDialog } from "@/components/pages/share-dialog";
import { getIconComponent } from "@/components/pages/icon-picker";
import type { Page, PageShare } from "@/types";

interface PageHeaderProps {
  page: Page;
  shares: PageShare[];
  canEdit: boolean;
}

export function PageHeader({ page, shares, canEdit }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {(() => {
          const Icon = getIconComponent(page.icon);
          return <Icon className="h-4 w-4 text-muted-foreground" />;
        })()}
        <span className="text-sm font-medium truncate max-w-[200px]">
          {page.title || "Untitled"}
        </span>
        <SaveIndicator />
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Edited{" "}
          {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
        </span>
        <ShareDialog page={page} shares={shares} canEdit={canEdit} />
      </div>
    </div>
  );
}
