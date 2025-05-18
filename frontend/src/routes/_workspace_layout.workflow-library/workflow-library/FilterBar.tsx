import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagFilter } from "./TagFilter";
import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

function SearchInput() {
  const [{ q }, updateParams] = useValidatedSearchParams();
  const [localValue, setLocalValue] = useState(q ?? "");

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value });
  }, 300);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search workflows..."
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          debouncedSetSearch(e.target.value);
        }}
        className="pl-8"
      />
    </div>
  );
}

export function FilterBar() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
      <SearchInput />
      <TagFilter />
    </div>
  );
}
