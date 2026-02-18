"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus, Crown, Pencil, Eye } from "lucide-react";
import {
  updateWorkspaceAction,
  deleteWorkspaceAction,
  inviteMemberAction,
  removeMemberAction,
} from "@/actions/workspace.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/shared/spinner";
import type { Workspace, WorkspaceMember } from "@/types";

interface SettingsContentProps {
  workspace: Workspace;
  members: (WorkspaceMember & {
    profile: {
      email: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  })[];
  isOwner: boolean;
  currentUserId: string;
}

const roleIcons = {
  owner: Crown,
  editor: Pencil,
  viewer: Eye,
};

export function SettingsContent({
  workspace,
  members,
  isOwner,
  currentUserId,
}: SettingsContentProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const handleUpdateName = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updateWorkspaceAction(workspaceId, formData);
      if (!result.success) setError(result.error || "Failed to update");
    });
  };

  const handleInvite = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await inviteMemberAction(workspaceId, formData);
      if (!result.success) setError(result.error || "Failed to invite");
      else router.refresh();
    });
  };

  const handleRemoveMember = (userId: string) => {
    startTransition(async () => {
      await removeMemberAction(workspaceId, userId);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkspaceAction(workspaceId);
    });
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Manage workspace name and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleUpdateName} className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={workspace.name}
                disabled={!isOwner || isPending}
              />
            </div>
            {isOwner && (
              <Button type="submit" disabled={isPending} className="self-end">
                {isPending ? <Spinner size="sm" /> : "Save"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage who has access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite form */}
          {isOwner && (
            <>
              <form action={handleInvite} className="flex gap-3">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  required
                  className="flex-1"
                  disabled={isPending}
                />
                <select
                  name="role"
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  defaultValue="editor"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button
                  type="submit"
                  disabled={isPending}
                  size="sm"
                  className="gap-1"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </form>
              <Separator />
            </>
          )}

          {/* Members list */}
          <div className="space-y-2">
            {members.map((member) => {
              const RoleIcon =
                roleIcons[member.role as keyof typeof roleIcons] || Eye;
              const initials = member.profile.full_name
                ? member.profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : member.profile.email[0].toUpperCase();

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.profile.full_name || member.profile.email}
                        {member.user_id === currentUserId && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </Badge>
                    {isOwner &&
                      member.user_id !== currentUserId &&
                      member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions. Proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete workspace</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All pages and data in &quot;
                    {workspace.name}&quot; will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? <Spinner size="sm" /> : "Delete permanently"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
