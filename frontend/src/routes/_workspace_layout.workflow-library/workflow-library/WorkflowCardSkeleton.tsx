import { cn } from "@/lib/utils";

export function WorkflowCardSkeleton() {
  return (
    <div
      className={cn(
        "relative grid rounded-xl p-2",
        "bg-white dark:bg-slate-900",
        "border-2 border-slate-300 dark:border-slate-800",
        "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
        "transition-all duration-300",
        "group overflow-hidden w-full min-w-0"
      )}
      style={{ minHeight: 180 }}
    >
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="flex items-center rounded-lg mb-2">
        <div className="mr-2 h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-6 w-2/3 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="flex items-center justify-between min-w-0 min-h-0 mb-2">
        <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-2 rounded-lg overflow-hidden mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-5 w-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="w-full mb-2">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20 min-h-0 pointer-events-none">
        <div className="text-xs line-clamp-2 text-center font-normal drop-shadow-sm text-slate-700 dark:text-slate-200">
          <div className="h-4 w-3/4 mx-auto animate-pulse rounded bg-slate-100 dark:bg-slate-800 mb-1" />
          <div className="h-4 w-1/2 mx-auto animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <div className="h-8 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-8 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}
