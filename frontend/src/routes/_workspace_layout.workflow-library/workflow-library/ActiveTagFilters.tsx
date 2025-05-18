import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useValidatedSearchParams } from "./hooks/useSearchParams";

export function ActiveTagFilters() {
  const [{ tags }, updateParams] = useValidatedSearchParams();

  if (!tags?.length) return null;

  const removeTag = (tagToRemove: string) => {
    updateParams({
      tags: tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Filtered by:
      </span>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs py-0 h-5 flex items-center gap-1 pr-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
      </div>
    </div>
  );
}
