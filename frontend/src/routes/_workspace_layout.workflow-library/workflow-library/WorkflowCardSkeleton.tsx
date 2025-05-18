import { cn } from "@/lib/utils";

export function WorkflowCardSkeleton() {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      )}
    >
      <div className="p-3 flex-1">
        <div className="flex justify-between items-start mb-1.5">
          {/* Status badge skeleton */}
          <div className="h-5 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

          {/* Action buttons skeleton */}
          <div className="flex gap-1">
            <div className="h-8 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800 mb-1" />

        {/* Description skeleton */}
        <div className="space-y-1 mb-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-3 py-2 flex justify-between items-center">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
