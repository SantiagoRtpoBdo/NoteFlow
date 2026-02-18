"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Typography from "@tiptap/extension-typography";
import { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "@/stores/editor.store";
import { updatePageAction } from "@/actions/page.actions";
import { AUTOSAVE_DELAY_MS } from "@/lib/constants";
import { EditorToolbar } from "./editor-toolbar";
import type { Page } from "@/types";

interface BlockEditorProps {
  page: Page;
  editable?: boolean;
}

export function BlockEditor({ page, editable = true }: BlockEditorProps) {
  const { setIsSaving, setLastSavedAt, setHasUnsavedChanges } =
    useEditorStore();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageIdRef = useRef(page.id);

  // Track page id changes
  useEffect(() => {
    pageIdRef.current = page.id;
  }, [page.id]);

  const saveContent = useCallback(
    async (editor: Editor) => {
      const content = editor.getJSON();
      setIsSaving(true);

      try {
        await updatePageAction(pageIdRef.current, { content });
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Failed to save:", error);
        setHasUnsavedChanges(true);
      } finally {
        setIsSaving(false);
      }
    },
    [setIsSaving, setLastSavedAt, setHasUnsavedChanges],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return "Type '/' for commands, or start writing...";
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      CodeBlock,
      Typography,
    ],
    content: page.content as Record<string, unknown> | undefined,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-0",
      },
    },
    onUpdate: ({ editor }) => {
      setHasUnsavedChanges(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveContent(editor);
      }, AUTOSAVE_DELAY_MS);
    },
  });

  // Content reset is handled by remounting with key={page.id} from the parent

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
