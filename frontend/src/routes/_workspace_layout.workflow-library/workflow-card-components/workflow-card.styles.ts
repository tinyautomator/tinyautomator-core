import { cn } from "@/lib/utils";
import {
  Play,
  FileText,
  Pause,
  AlertTriangle,
  Archive,
  Copy,
} from "lucide-react";

// Card Layout Styles
export const CARD_BASE_STYLES = cn(
  "relative grid rounded-xl p-2 h-full",
  "bg-white dark:bg-tertiary",
  "border-2 border-slate-300 dark:border-slate-800",
  "transition-all duration-300",
  "hover:translate-y-[-2px] ",
  "hover:border-slate-300 dark:hover:border-slate-700",
  "group overflow-hidden",
);

export const CARD_ACTION_BUTTON_STYLES = cn(
  "absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity",
);

export const CARD_CONTENT_STYLES = cn(
  "flex items-center justify-between min-w-0 min-h-0",
);

export const CARD_FOOTER_STYLES = cn("flex justify-between items-center gap-2");

export const TRUNCATE_STYLES = cn("truncate min-w-0");

// Hover Effect Styles
export const GROUP_HOVER_OPACITY_ZERO = cn(
  "opacity-100 group-hover:opacity-0 transition-opacity duration-200",
);

export const GROUP_HOVER_OPACITY_FULL = cn(
  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
);

// Text Color Styles
export const TEXT_SLATE_DARK_SLATE_200 = cn(
  "text-slate-800 dark:text-slate-200",
);

export const TEXT_SLATE_500_DARK_SLATE_400 = cn(
  "text-slate-500 dark:text-slate-400",
);

// Status Badge Styles
export const STATUS_BADGE_BASE = cn(
  "inline-flex items-center px-2.5 py-1 rounded-md ",
);

export const STATUS_BADGE_ICON = cn(
  "flex items-center justify-center w-4 h-4 rounded-full mr-1.5",
);

export const STATUS_BADGE_TEXT = cn(
  "font-medium text-xs capitalize whitespace-nowrap",
);

export const STATUS_BADGE_ICON_INNER = cn(
  "w-2.5 h-2.5 text-white fill-zinc-100",
);

// Action Button Styles
export const ACTION_BUTTON_BASE = cn(
  "h-7 w-7",
  "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
  "hover:bg-white dark:hover:bg-slate-900",
  "shadow-sm hover:shadow-md transition-all duration-200",
);

export const ACTION_BUTTON_ICON = cn(
  "h-3.5 w-3.5 text-slate-600 dark:text-slate-400",
);

// Action Menu Styles
export const ACTION_MENU_ITEM = cn("flex items-center gap-2");

export const ACTION_MENU_ITEM_ICON = cn("h-3.5 w-3.5");

export const ACTION_MENU_ITEM_DANGER = cn(
  "hover:bg-red-50 dark:hover:bg-red-950/30",
  "text-red-500 dark:text-red-400",
);

export const ACTION_MENU_ITEM_DEFAULT = cn(
  "hover:bg-slate-100 dark:hover:bg-slate-800",
  "text-slate-600 dark:text-slate-400",
);

// Status Configuration
export const WORKFLOW_STATUS_CONFIG = {
  active: {
    gradientFrom: "from-emerald-400",
    gradientTo: "to-green-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    icon: Play,
    tooltip: "This workflow is currently active and running",
  },
  draft: {
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: FileText,
    tooltip: "This workflow is in draft mode and not yet published",
  },
  archived: {
    gradientFrom: "from-gray-400",
    gradientTo: "to-gray-600",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: Archive,
    tooltip: "This workflow has been archived",
  },
  templates: {
    gradientFrom: "from-cyan-400",
    gradientTo: "to-sky-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    icon: Copy,
    tooltip: "This is a template workflow",
  },
} as const;

// Run State Configuration
export const WORKFLOW_RUN_STATE_CONFIG = {
  running: {
    gradientFrom: "from-violet-400",
    gradientTo: "to-purple-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    icon: Play,
    tooltip: "This workflow is currently running",
    animate: "animate-pulse",
  },
  error: {
    gradientFrom: "from-red-400",
    gradientTo: "to-rose-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    icon: AlertTriangle,
    tooltip: "This workflow has encountered an error",
    animate: "animate-pulse",
  },
  paused: {
    gradientFrom: "from-amber-400",
    gradientTo: "to-yellow-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    icon: Pause,
    tooltip: "This workflow is temporarily paused",
    animate: "animate-pulse",
  },
} as const;
