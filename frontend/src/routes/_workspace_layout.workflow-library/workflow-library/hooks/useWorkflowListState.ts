import { useCallback } from "react";
import { useValidatedSearchParams } from "./useSearchParams";
import { useDebouncedCallback } from "use-debounce";
import type { SearchParams } from "../utils/schemas";

const DEBOUNCE_TIME = 500;

export interface WorkflowListState extends SearchParams {
  isSearching?: boolean;
  selectedWorkflowId?: number;
}

export function useWorkflowListState() {
  const [validatedParams, updateParams] = useValidatedSearchParams();

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value });
  }, DEBOUNCE_TIME);

  const updateState = useCallback(
    (newState: Partial<WorkflowListState>) => {
      updateParams(newState);
    },
    [updateParams],
  );

  const clearSearch = useCallback(() => {
    updateParams({ q: "" });
  }, [updateParams]);

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams],
  );

  const setTags = useCallback(
    (tags: string[]) => {
      updateParams({ tags });
    },
    [updateParams],
  );

  return {
    // Current state
    state: validatedParams,
    validatedParams,

    // Actions
    updateState,
    clearSearch,
    setPage,
    setTags,
    debouncedSetSearch,

    // Derived state
    currentTab: validatedParams.tab,
    currentPage: validatedParams.page,
    currentTags: validatedParams.tags,
    searchQuery: validatedParams.q,
  };
}
