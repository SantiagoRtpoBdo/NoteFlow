"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Search } from "lucide-react";
import { searchPagesAction } from "@/actions/page.actions";
import { getIconComponent } from "@/components/pages/icon-picker";
import type { Page } from "@/types";
import { useDebounce } from "@/hooks";

interface SearchCommandProps {
  workspaceId: string;
}

export function SearchCommand({ workspaceId }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Page[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const performSearch = useDebounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const result = await searchPagesAction(workspaceId, searchQuery);
    if (result.success && result.data) {
      setResults(result.data);
    }
    setIsSearching(false);
  }, 300);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      performSearch(value);
    },
    [performSearch],
  );

  const handleSelect = useCallback(
    (pageId: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(`/${workspaceId}/${pageId}`);
    },
    [router, workspaceId],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors w-full"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages..."
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? "Searching..." : "No pages found."}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Pages">
              {results.map((page) => (
                <CommandItem
                  key={page.id}
                  value={page.id}
                  onSelect={() => handleSelect(page.id)}
                  className="cursor-pointer"
                >
                  {(() => {
                    const Icon = getIconComponent(page.icon);
                    return (
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    );
                  })()}
                  <span>{page.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!query && (
            <CommandGroup heading="Quick actions">
              <CommandItem className="cursor-pointer text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Type to search pages...
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
