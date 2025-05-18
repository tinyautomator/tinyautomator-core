import { useLoaderData } from "react-router";
import { useMemo } from "react";
import { useValidatedSearchParams } from "./useSearchParams";
import { getWorkflowData } from "../utils/filterWorkflows";
import type { Workflow } from "../../route";

const ITEMS_PER_PAGE = 6;

export function useFilteredWorkflows() {
  const workflows = useLoaderData<Workflow[]>();
  const [params, updateParams] = useValidatedSearchParams();
  const page = Number(params.page) || 1;

  const { workflows: filteredWorkflows, ...rest } = useMemo(
    () => getWorkflowData(workflows, params),
    [workflows, params]
  );

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkflows.length / ITEMS_PER_PAGE)
  );

  // Auto-correct invalid page numbers
  const validPage = Math.min(Math.max(1, page), totalPages);
  if (validPage !== page) {
    // If page is invalid, update URL to valid page
    updateParams({ page: String(validPage) });
  }

  const paginatedWorkflows = filteredWorkflows.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE
  );

  return {
    workflows: paginatedWorkflows,
    pagination: {
      currentPage: validPage,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
      totalItems: filteredWorkflows.length,
    },
    ...rest,
  };
}
