import { useCallback } from "react";
import { useValidatedSearchParams } from "./useSearchParams";
import { useDebouncedCallback } from "use-debounce";
import type { SearchParams } from "../utils/schemas";

export interface WorkflowListState extends SearchParams {
  isSearching?: boolean;
  selectedWorkflowId?: number;
}

export function useWorkflowListState() {
  // Get validated search params with total pages
  const [searchParams, setSearchParams] = useValidatedSearchParams();

  // Debounced search update to prevent too many URL updates
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchParams({ q: value });
  }, 500);

  // Update state
  const updateState = useCallback(
    (newState: Partial<WorkflowListState>) => {
      setSearchParams(newState);
    },
    [setSearchParams],
  );

  // Clear search state
  const clearSearch = useCallback(() => {
    setSearchParams({ q: "" });
  }, [setSearchParams]);

  // Update page
  const setPage = useCallback(
    (page: number) => {
      setSearchParams({ page });
    },
    [setSearchParams],
  );

  // Update tags
  const setTags = useCallback(
    (tags: string[]) => {
      setSearchParams({ tags });
    },
    [setSearchParams],
  );

  return {
    // Current state
    state: searchParams,
    searchParams,

    // Actions
    updateState,
    clearSearch,
    setPage,
    setTags,
    debouncedSetSearch,

    // Derived state
    currentTab: searchParams.tab,
    currentPage: searchParams.page,
    currentTags: searchParams.tags,
    searchQuery: searchParams.q,
  };
}
