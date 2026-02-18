"use client";

import { useState, useCallback } from "react";
import { updatePageAction } from "@/actions/page.actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  BookOpen,
  Bookmark,
  Lightbulb,
  Target,
  Rocket,
  Star,
  Flame,
  Gem,
  Palette,
  Music,
  Monitor,
  Wrench,
  BarChart3,
  TrendingUp,
  FolderKanban,
  Tag,
  Pin,
  Link2,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  Home,
  Globe,
  PartyPopper,
  Bot,
  Ruler,
  Puzzle,
  Key,
  Settings,
  Heart,
  Shield,
  Camera,
  Coffee,
  Code2,
  Database,
  Layers,
  Map,
  Users,
  Bell,
  Search,
  Award,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Page } from "@/types";

export interface IconOption {
  name: string;
  icon: LucideIcon;
}

export const PAGE_ICONS: IconOption[] = [
  { name: "file-text", icon: FileText },
  { name: "file-code", icon: FileCode },
  { name: "file-spreadsheet", icon: FileSpreadsheet },
  { name: "folder", icon: Folder },
  { name: "folder-open", icon: FolderOpen },
  { name: "book-open", icon: BookOpen },
  { name: "bookmark", icon: Bookmark },
  { name: "lightbulb", icon: Lightbulb },
  { name: "target", icon: Target },
  { name: "rocket", icon: Rocket },
  { name: "star", icon: Star },
  { name: "flame", icon: Flame },
  { name: "gem", icon: Gem },
  { name: "palette", icon: Palette },
  { name: "music", icon: Music },
  { name: "monitor", icon: Monitor },
  { name: "wrench", icon: Wrench },
  { name: "bar-chart", icon: BarChart3 },
  { name: "trending-up", icon: TrendingUp },
  { name: "folder-kanban", icon: FolderKanban },
  { name: "tag", icon: Tag },
  { name: "pin", icon: Pin },
  { name: "link", icon: Link2 },
  { name: "check-circle", icon: CheckCircle2 },
  { name: "x-circle", icon: XCircle },
  { name: "zap", icon: Zap },
  { name: "sparkles", icon: Sparkles },
  { name: "message-circle", icon: MessageCircle },
  { name: "mail", icon: Mail },
  { name: "calendar", icon: Calendar },
  { name: "clock", icon: Clock },
  { name: "home", icon: Home },
  { name: "globe", icon: Globe },
  { name: "party-popper", icon: PartyPopper },
  { name: "bot", icon: Bot },
  { name: "ruler", icon: Ruler },
  { name: "puzzle", icon: Puzzle },
  { name: "key", icon: Key },
  { name: "settings", icon: Settings },
  { name: "heart", icon: Heart },
  { name: "shield", icon: Shield },
  { name: "camera", icon: Camera },
  { name: "coffee", icon: Coffee },
  { name: "code", icon: Code2 },
  { name: "database", icon: Database },
  { name: "layers", icon: Layers },
  { name: "map", icon: Map },
  { name: "users", icon: Users },
  { name: "bell", icon: Bell },
  { name: "search", icon: Search },
  { name: "award", icon: Award },
];

const DEFAULT_ICON = "file-text";

export function getIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return FileText;
  const found = PAGE_ICONS.find((i) => i.name === iconName);
  return found ? found.icon : FileText;
}

interface IconPickerProps {
  page: Page;
  editable?: boolean;
}

export function IconPicker({ page, editable = true }: IconPickerProps) {
  const [selectedIcon, setSelectedIcon] = useState(page.icon || DEFAULT_ICON);
  const [open, setOpen] = useState(false);

  const IconComponent = getIconComponent(selectedIcon);

  const handleSelect = useCallback(
    async (iconName: string) => {
      setSelectedIcon(iconName);
      setOpen(false);
      await updatePageAction(page.id, { icon: iconName });
    },
    [page.id],
  );

  if (!editable) {
    return <IconComponent className="h-12 w-12 text-muted-foreground" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hover:bg-accent rounded-lg p-2 transition-colors cursor-pointer">
          <IconComponent className="h-12 w-12 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <p className="text-xs font-medium text-muted-foreground mb-2">Choose an icon</p>
        <div className="grid grid-cols-8 gap-1">
          {PAGE_ICONS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent",
                selectedIcon === name && "bg-accent ring-1 ring-primary",
              )}
            >
              <Icon className="h-4 w-4 text-foreground/80" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
