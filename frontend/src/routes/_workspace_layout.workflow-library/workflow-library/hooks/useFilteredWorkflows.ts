import { useLoaderData } from "react-router";
import { useMemo } from "react";
import { useValidatedSearchParams } from "../utils/schemas";
import { getWorkflowData } from "../utils/filterWorkflows";
import type { Workflow } from "../../route";

export function useFilteredWorkflows() {
  const workflows = useLoaderData<Workflow[]>();
  const [params] = useValidatedSearchParams();

  return useMemo(() => getWorkflowData(workflows, params), [workflows, params]);
}
