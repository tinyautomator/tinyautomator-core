import { useLoaderData } from "react-router";
import { useMemo } from "react";
import { useValidatedSearchParams } from "./useSearchParams";
import { getWorkflowData } from "../utils/filterWorkflows";
import type { Workflow } from "../../route";

const ITEMS_PER_PAGE = 8;

export function useFilteredWorkflows() {
  const workflows = useLoaderData<Workflow[]>();

  // Get validated params first
  const [params] = useValidatedSearchParams();

  // Get filtered workflows using validated params
  const { workflows: filteredWorkflows, ...rest } = useMemo(
    () => getWorkflowData(workflows, params),
    [workflows, params]
  );

  // Calculate total pages based on filtered workflows
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkflows.length / ITEMS_PER_PAGE)
  );

  // Update params with correct total pages
  const [validatedParams] = useValidatedSearchParams(totalPages);

  // Page is already validated and transformed to a number by the schema
  const page = validatedParams.page;

  const paginatedWorkflows = filteredWorkflows.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return {
    workflows: paginatedWorkflows,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalItems: filteredWorkflows.length,
    },
    ...rest,
  };
}
