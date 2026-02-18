"use client";

import { useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Settings, ChevronsLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar.store";
import { UserMenu } from "@/components/layout/user-menu";
import { SearchCommand } from "@/components/layout/search-command";
import { PageList } from "@/components/layout/page-list";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createPageAction } from "@/actions/page.actions";
import type { AuthUser, Page, Workspace } from "@/types";

interface SidebarProps {
  user: AuthUser;
  workspace: Workspace;
  pages: Page[];
  activePage?: string;
}

export function Sidebar({ user, workspace, pages, activePage }: SidebarProps) {
  const { isOpen, toggle } = useSidebarStore();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const handleCreatePage = () => {
    startTransition(async () => {
      const result = await createPageAction(workspaceId);
      if (result.success && result.data) {
        router.push(`/${workspaceId}/${result.data.id}`);
      }
    });
  };

  return (
    <>
      {/* Mobile toggle */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 h-8 w-8 md:hidden"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 md:relative md:z-0",
          !isOpen && "-translate-x-full md:-translate-x-full",
          isOpen && "translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <UserMenu user={user} />
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggle}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse sidebar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-1">
          <SearchCommand workspaceId={workspaceId} />
        </div>

        <Separator className="my-1" />

        {/* Pages */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pages
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCreatePage}
                disabled={isPending}
                className="flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent transition-colors"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New page</TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="flex-1 px-1">
          <PageList pages={pages} activePage={activePage} />
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleCreatePage}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            New page
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => router.push(`/${workspaceId}/settings`)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Collapsed hover trigger */}
      {!isOpen && (
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-30 h-8 w-8"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
