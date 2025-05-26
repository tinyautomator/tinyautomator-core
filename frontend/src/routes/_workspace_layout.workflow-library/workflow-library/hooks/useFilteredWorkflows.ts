import { useLoaderData } from "react-router";
import { useMemo } from "react";
import { useValidatedSearchParams } from "./useSearchParams";
import { getWorkflowData } from "../utils/filterWorkflows";
import type { Workflow } from "../../route";

const ITEMS_PER_PAGE = 8;

export function useFilteredWorkflows() {
  const workflows = useLoaderData<Workflow[]>();

  const [params] = useValidatedSearchParams();

  const { workflows: filteredWorkflows, ...rest } = useMemo(
    () => getWorkflowData(workflows, params),
    [workflows, params]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkflows.length / ITEMS_PER_PAGE)
  );

  const page = params.page;

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
