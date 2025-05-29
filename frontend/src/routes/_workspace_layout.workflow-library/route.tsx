import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { WorkflowTabs } from "./WorkflowTabs";
import { WorkflowList } from "./WorkflowList";
import { WorkflowController } from "./WorkflowController";
import { ActiveTagFilters } from "./ActiveTagFilters";
import { cn } from "@/lib/utils";
import { Workflow, workflowApi } from "@/api";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { EmptyState } from "./LibraryEmptyState";
import { LIBRARY_GRID_LAYOUT_STYLES } from "./utils/library-styles";
import { WorkflowPagination } from "./LibraryWorkflowPagination";
import { Route } from "./+types/route";
import type { ShouldRevalidateFunction } from "react-router";

export async function loader(): Promise<Workflow[]> {
  return await workflowApi.getUserWorkflows();
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
}: {
  currentUrl: URL;
  nextUrl: URL;
}) => {
  // Only revalidate if the search params change (excluding tab changes)
  const currentParams = new URLSearchParams(currentUrl.search);
  const nextParams = new URLSearchParams(nextUrl.search);

  // Remove the tab parameter from both
  currentParams.delete("tab");
  nextParams.delete("tab");

  // Compare the remaining parameters
  return currentParams.toString() !== nextParams.toString();
};

export default function WorkflowLibrary({ loaderData }: Route.ComponentProps) {
  const { workflows: filteredWorkflows } = useFilteredWorkflows(loaderData);
  return (
    <div
      className={cn(
        "p-6 flex flex-col items-start h-full rounded-xl justify-between gap-4 ",
      )}
    >
      <div
        className={cn(
          "shrink-0 flex justify-between items-center",
          "border-b border-slate-100 dark:border-slate-800",
          "w-full ",
        )}
      >
        <div className="flex flex-col gap-1 leading-tight">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            Workflow Library
          </h3>
          <p className="text-muted-foreground">
            Manage and organize your automated workflows
          </p>
        </div>
        <CreateWorkflowButton />
      </div>
      <WorkflowController workflows={filteredWorkflows} />
      <WorkflowTabs workflows={filteredWorkflows} />
      <ActiveTagFilters />
      <div
        className={cn("flex-1 overflow-y-auto items-start w-full select-none")}
      >
        <WorkflowList
          workflows={filteredWorkflows}
          emptyState={<EmptyState />}
          pagination={<WorkflowPagination workflows={filteredWorkflows} />}
          gridClassName={LIBRARY_GRID_LAYOUT_STYLES}
        />
      </div>
    </div>
  );
}
