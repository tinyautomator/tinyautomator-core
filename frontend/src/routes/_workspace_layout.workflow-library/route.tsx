import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { WorkflowTabs } from "./workflow-library/WorkflowTabs";
import { WorkflowList } from "./workflow-library/WorkflowList";
import { WorkflowController } from "./workflow-library/WorkflowController";
import { ActiveTagFilters } from "./workflow-library/ActiveTagFilters";
import { cn } from "@/lib/utils";
import { workflowApi } from "@/api";
import { useFilteredWorkflows } from "./workflow-library/hooks/useFilteredWorkflows";
import { EmptyState } from "./workflow-library/LibraryEmptyState";
import { LIBRARY_GRID_LAYOUT_STYLES } from "./workflow-library/utils/library-styles";
import { WorkflowPagination } from "./workflow-library/LibraryWorkflowPagination";

// TODO: update global workflow type to match the api response
export interface Workflow {
  id: number;
  title: string;
  description: string;
  lastEdited: string;
  status: "active" | "draft" | "archived" | "templates";
  nodeCount: number;
  created_at: string;
  updated_at: string;

  tags: string[];
  isFavorite: boolean;
}
export async function loader() {
  const data = await workflowApi.getUserWorkflows();

  const mappedData = data.map((workflow) => ({
    id: workflow.id,
    title: workflow.name,
    description: workflow.description,
    status: workflow.status,
    // TODO: Add these fields to the api response
    lastEdited: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    tags: ["type", "script", "paid"],
  }));

  return mappedData;
}
function WorkflowLibraryHeader() {
  return (
    <div
      className={cn(
        "shrink-0 flex justify-between items-center",
        "border-b border-slate-100 dark:border-slate-800",
        "w-full "
      )}
    >
      <div className="flex flex-col gap-1 leading-tight">
        <h1
          className={cn(
            "text-xl font-bold items-center",
            "text-slate-900 dark:text-white"
          )}
        >
          Workflow Library
        </h1>
        <p className={cn("text-sm text-slate-500 dark:text-slate-400")}>
          Manage and organize your automated workflows
        </p>
      </div>
      <CreateWorkflowButton />
    </div>
  );
}

export default function WorkflowLibrary() {
  const { workflows } = useFilteredWorkflows();
  return (
    <div
      className={cn(
        "px-4 flex flex-col items-start h-full rounded-xl justify-between gap-4 ",
        "bg-white dark:bg-slate-950"
      )}
    >
      <WorkflowLibraryHeader />

      <WorkflowController />

      <WorkflowTabs />
      <ActiveTagFilters />

      <div
        className={cn("flex-1 overflow-y-auto items-start w-full select-none")}
      >
        <WorkflowList
          workflows={workflows}
          emptyState={<EmptyState />}
          pagination={<WorkflowPagination />}
          gridClassName={LIBRARY_GRID_LAYOUT_STYLES}
        />
      </div>
    </div>
  );
}
