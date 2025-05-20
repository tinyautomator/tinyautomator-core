import { cn } from "@/lib/utils";

export function WorkflowCardSkeleton() {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800",
        "overflow-hidden flex flex-col",
        "shadow-sm",
        "w-full h-[180px]",
        "relative"
      )}
    >
      <div className="p-3 flex-1 relative flex flex-col">
        <div className="flex-1">
          {/* Title skeleton */}
          <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800 mb-1.5" />

          {/* Description skeleton */}
          <div className="space-y-1 mb-2">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>

        <div className="space-y-3">
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>

          {/* Status and time indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Node count badge in bottom right */}
      <div className="absolute bottom-2 right-2">
        <div className="flex flex-col items-center justify-center rounded-md px-2 py-1 bg-slate-100 dark:bg-slate-800 animate-pulse">
          <div className="h-6 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mt-1" />
        </div>
      </div>
    </div>
  );
}
