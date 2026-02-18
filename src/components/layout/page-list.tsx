"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getIconComponent } from "@/components/pages/icon-picker";
import { createPageAction, archivePageAction } from "@/actions/page.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Page } from "@/types";

interface PageItemProps {
  page: Page;
  level: number;
  allPages: Page[];
  activePage?: string;
}

export function PageItem({ page, level, allPages, activePage }: PageItemProps) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const childPages = allPages.filter((p) => p.parent_id === page.id);
  const isActive = activePage === page.id;

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await createPageAction(workspaceId, page.id);
      if (result.success && result.data) {
        setIsExpanded(true);
        router.push(`/${workspaceId}/${result.data.id}`);
      }
    });
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await archivePageAction(page.id, workspaceId);
      router.push(`/${workspaceId}`);
    });
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/${workspaceId}/${page.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(`/${workspaceId}/${page.id}`);
        }}
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent transition-colors cursor-pointer min-h-[28px]",
          isActive && "bg-accent font-medium",
          isPending && "opacity-50",
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent-foreground/10 transition-transform",
            isExpanded && "rotate-90",
            childPages.length === 0 && "invisible",
          )}
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Icon */}
        {(() => {
          const Icon = getIconComponent(page.icon);
          return (
            <Icon className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" />
          );
        })()}

        {/* Title */}
        <span className="truncate flex-1">{page.title || "Untitled"}</span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent-foreground/10"
              >
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              <DropdownMenuItem onClick={handleArchive}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={handleCreateChild}
            className="flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent-foreground/10"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && childPages.length > 0 && (
        <div>
          {childPages.map((child) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              allPages={allPages}
              activePage={activePage}
            />
          ))}
        </div>
      )}

      {/* Empty children state */}
      {isExpanded && childPages.length === 0 && (
        <p
          className="py-1 text-xs text-muted-foreground"
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        >
          No pages inside
        </p>
      )}
    </div>
  );
}

interface PageListProps {
  pages: Page[];
  activePage?: string;
}

export function PageList({ pages, activePage }: PageListProps) {
  const rootPages = pages.filter((p) => !p.parent_id);

  if (rootPages.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-2 text-xs text-muted-foreground">
          No pages yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-1">
      {rootPages.map((page) => (
        <PageItem
          key={page.id}
          page={page}
          level={0}
          allPages={pages}
          activePage={activePage}
        />
      ))}
    </div>
  );
}
