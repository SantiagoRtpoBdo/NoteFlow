"use client";

import { useState, useRef, useCallback } from "react";
import { updatePageAction } from "@/actions/page.actions";
import { useDebounce } from "@/hooks";
import type { Page } from "@/types";

interface PageTitleProps {
  page: Page;
  editable?: boolean;
}

export function PageTitle({ page, editable = true }: PageTitleProps) {
  const [title, setTitle] = useState(page.title);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const saveTitle = useDebounce(async (newTitle: string) => {
    await updatePageAction(page.id, { title: newTitle || "Untitled" });
  }, 800);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setTitle(value);
      saveTitle(value);
    },
    [saveTitle],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Move focus to editor
      const editor = document.querySelector(".ProseMirror");
      if (editor instanceof HTMLElement) {
        editor.focus();
      }
    }
  };

  if (!editable) {
    return (
      <h1 className="text-4xl font-bold tracking-tight break-words">
        {title || "Untitled"}
      </h1>
    );
  }

  return (
    <textarea
      ref={inputRef}
      value={title}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Untitled"
      className="w-full resize-none bg-transparent text-4xl font-bold tracking-tight placeholder:text-muted-foreground/50 focus:outline-none overflow-hidden"
      rows={1}
      style={{ height: "auto" }}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = target.scrollHeight + "px";
      }}
    />
  );
}
