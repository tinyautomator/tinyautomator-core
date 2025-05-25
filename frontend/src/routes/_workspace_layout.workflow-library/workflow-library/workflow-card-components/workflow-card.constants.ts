import {
  Play,
  FileText,
  Pause,
  AlertTriangle,
  Archive,
  Copy,
} from "lucide-react";

export const GROUP_HOVER_OPACITY_ZERO =
  "opacity-100 group-hover:opacity-0 transition-opacity duration-200";
export const GROUP_HOVER_OPACITY_FULL =
  "opacity-0 group-hover:opacity-100 transition-opacity duration-200";
export const TEXT_SLATE_DARK_SLATE_200 = "text-slate-800 dark:text-slate-200";
export const TEXT_SLATE_500_DARK_SLATE_400 =
  "text-slate-500 dark:text-slate-400";

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

// TODO: Use this in recent runs section
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

export type WorkflowStatus = keyof typeof WORKFLOW_STATUS_CONFIG;
export type WorkflowState = keyof typeof WORKFLOW_RUN_STATE_CONFIG;
