"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Globe, Trash2, ChevronDown, Copy, Check } from "lucide-react";
import {
  sharePageAction,
  updateShareRoleAction,
  removeShareAction,
} from "@/actions/sharing.actions";
import { updatePageAction } from "@/actions/page.actions";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Page, PageShare } from "@/types";

interface ShareDialogProps {
  page: Page;
  shares: PageShare[];
  canEdit: boolean;
}

export function ShareDialog({
  page,
  shares: initialShares,
  canEdit,
}: ShareDialogProps) {
  const [shares, setShares] = useState(initialShares);
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleShare = async (formData: FormData) => {
    startTransition(async () => {
      const result = await sharePageAction(page.id, formData);
      if (result.success && result.data) {
        setShares((prev) => [...prev, result.data!]);
      }
    });
  };

  const handleRemoveShare = async (shareId: string) => {
    startTransition(async () => {
      const result = await removeShareAction(shareId);
      if (result.success) {
        setShares((prev) => prev.filter((s) => s.id !== shareId));
      }
    });
  };

  const handleTogglePublish = async () => {
    startTransition(async () => {
      const result = await updatePageAction(page.id, {
        is_published: !isPublished,
      });
      if (result.success) {
        setIsPublished(!isPublished);
      }
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shared/${page.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{page.title}&quot;</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this page.
          </DialogDescription>
        </DialogHeader>

        {canEdit && (
          <>
            {/* Invite form */}
            <form action={handleShare} className="flex gap-2">
              <Input
                name="email"
                type="email"
                placeholder="Enter email address"
                required
                className="flex-1"
              />
              <input type="hidden" name="role" value="viewer" />
              <Button type="submit" disabled={isPending} size="sm">
                Invite
              </Button>
            </form>

            <Separator />
          </>
        )}

        {/* Current shares */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            People with access
          </Label>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Only workspace members have access.
            </p>
          ) : (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-accent"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {share.shared_with_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {share.role}
                    </Badge>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveShare(share.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Public access */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Publish to web</p>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link can view
                </p>
              </div>
            </div>
            {canEdit && (
              <Switch
                checked={isPublished}
                onCheckedChange={handleTogglePublish}
                disabled={isPending}
              />
            )}
          </div>

          {isPublished && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy public link"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
