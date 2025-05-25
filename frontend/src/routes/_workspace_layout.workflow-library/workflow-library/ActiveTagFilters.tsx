import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { useOptimisticParamValue } from "./hooks/useOptimisticParamValue";
import { Button } from "@/components/ui/button";

export function ActiveTagFilters() {
  const [{ tags }, updateParams] = useValidatedSearchParams();
  const [localTags, setLocalTags] = useOptimisticParamValue(tags);

  const removeTag = (tagToRemove: string) => {
    setLocalTags(localTags.filter((tag) => tag !== tagToRemove));
    updateParams({
      tags: tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const clearAllTags = () => {
    setLocalTags([]);
    updateParams({ tags: [] });
  };

  return (
    <div className="h-[42px]  border-b border-slate-100 dark:border-slate-800 flex items-center">
      <div className="flex items-center gap-2 w-full overflow-hidden">
        <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
          Filtered by:
        </span>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-1 py-2 min-w-min">
            {localTags?.length ? (
              <>
                {localTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs py-0 h-5 flex items-center gap-1 pr-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    <span className="px-1">{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-slate-300 dark:hover:bg-slate-600 rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag} filter</span>
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllTags}
                  className="h-5 px-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  Clear all
                </Button>
              </>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                No active filters
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
