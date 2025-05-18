import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagFilter } from "./TagFilter";
import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { useOptimisticParamValue } from "./hooks/useOptimisticParamValue";
import { useDebouncedCallback } from "use-debounce";
import * as React from "react";

const SearchInput: React.FC = () => {
  const [{ q }, updateParams] = useValidatedSearchParams();
  const [localValue, setLocalValue] = useOptimisticParamValue(q ?? "");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value });
  }, 300);

  const handleClear = () => {
    setLocalValue("");
    updateParams({ q: "" });
  };

  return (
    <div className="relative w-1/2">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search workflows..."
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          debouncedSetSearch(e.target.value);
        }}
        className="pl-8 pr-8"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-2.5 h-4 w-4 rounded-sm text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export function FilterBar() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
      <SearchInput />
      <TagFilter />
    </div>
  );
}
