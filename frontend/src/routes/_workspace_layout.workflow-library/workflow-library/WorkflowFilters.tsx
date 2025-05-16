"use client";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedCallback } from "use-debounce";
import { useState, useMemo } from "react";
import type { Workflow } from "../route";

interface WorkflowFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tagsFilter: string[];
  setTagsFilter: (tags: string[]) => void;
  showStatusFilter?: boolean;
  workflows: Workflow[];
}

export function WorkflowFilters({
  searchQuery,
  setSearchQuery,
  tagsFilter,
  setTagsFilter,
  showStatusFilter = true,
  workflows,
}: WorkflowFiltersProps) {
  const [localValue, setLocalValue] = useState(searchQuery);
  const debouncedSetSearch = useDebouncedCallback(setSearchQuery, 500);

  // TODO: Get unique tags from workflow tab not all workflows
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    workflows.forEach((workflow) => {
      workflow.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [workflows]);

  return (
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search workflows..."
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              debouncedSetSearch(e.target.value);
            }}
            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>

        {showStatusFilter && (
          <div className="w-full sm:w-48">
            <Select
              value={tagsFilter.join(",")}
              onValueChange={(value) => setTagsFilter(value.split(","))}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Filter by tag" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {/* TODO: turn into checkbox list to support multiple tags */}
                <SelectItem value="all">All tags</SelectItem>
                {uniqueTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
