import { cn } from "@/lib/utils";

export const TABS_LIST_STYLES = cn(
  "h-12 rounded-none border-b border-slate-100 dark:border-slate-800 bg-transparent mb-3 gap-1",
);

export const ICON_SPACING_STYLES = cn("-ms-0.5 me-1.5 opacity-60");

export const ACTIVE_TAB_STYLES = cn(
  "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none",
  "data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900",
  "data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100",
);

export const BORDER_STYLES = cn(
  "border-b border-slate-100 dark:border-slate-800",
);

export const COUNTER_STYLES = cn("bg-white dark:bg-slate-900");

export const GRID_LAYOUT_STYLES = cn(
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-fr p-1",
  "gap-8 h-full w-full",
);
