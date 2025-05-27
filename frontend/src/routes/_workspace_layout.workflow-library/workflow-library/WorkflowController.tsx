import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagFilter } from "./TagFilter";
import { useWorkflowListState } from "./hooks/useWorkflowListState";

const SearchInput = () => {
  const {
    state: { q },
    updateState,
  } = useWorkflowListState();

  return (
    <div className="relative w-1/2">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search workflows..."
        value={q ?? ""}
        onChange={(e) => updateState({ q: e.target.value })}
        className="pl-8 pr-8"
      />
      {q && (
        <button
          onClick={() => updateState({ q: "" })}
          className="absolute right-2 top-2.5 h-4 w-4 rounded-sm text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export function WorkflowController() {
  return (
    <div className="flex w-full items-center gap-3 border-b border-slate-100 dark:border-slate-800 select-none">
      <SearchInput />
      <TagFilter />
    </div>
  );
}
