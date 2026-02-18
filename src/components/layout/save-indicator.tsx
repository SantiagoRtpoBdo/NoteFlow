"use client";

import { useEditorStore } from "@/stores/editor.store";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/spinner";
import { Cloud, CloudOff } from "lucide-react";

export function SaveIndicator() {
  const { isSaving, lastSavedAt, hasUnsavedChanges } = useEditorStore();

  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Spinner size="sm" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudOff className="h-3.5 w-3.5" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Cloud className="h-3.5 w-3.5" />
        <span>
          Saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}
        </span>
      </div>
    );
  }

  return null;
}
