import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { WorkflowTabs } from "./workflow-library/WorkflowTabs";
import { WorkflowList } from "./workflow-library/WorkflowList";
import { WorkflowSearchBar } from "./workflow-library/WorkflowSearchBar";
import { ActiveTagFilters } from "./workflow-library/ActiveTagFilters";
import { sampleWorkflows } from "./workflow-library/utils/sampleWorkflows";
import { cn } from "@/lib/utils";

// TODO: update global workflow type to match the api response
export interface Workflow {
  id: number;
  title: string;
  description: string;
  lastEdited: string;
  status: "active" | "draft" | "archived" | "templates";
  // I like these extra fields for presentation purposes
  nodeCount: number;
  tags: string[];
  successRate?: number;
}
// TODO: implement refetching of workflows periodically?
export async function loader() {
  // const data = await workflowApi.getUserWorkflows();
  // const mappedData = data.map((workflow) => ({
  //   id: workflow.id,
  //   title: workflow.name,
  //   description: workflow.description,
  //   lastEdited: new Date().toISOString(),
  //   status: "active" as const,
  //   nodeCount: 20,
  //   tags: ["type", "script", "paid"],
  // }));

  // TODO: remove this once we update workflow schema
  return [...sampleWorkflows];
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
  return (
    <div
      className={cn(
        "px-4 flex flex-col items-start h-full rounded-xl justify-between gap-4 ",
        "bg-white dark:bg-slate-950"
      )}
    >
      <WorkflowLibraryHeader />

      <WorkflowSearchBar />

      <WorkflowTabs />
      <ActiveTagFilters />

      <div
        className={cn(
          "flex-1 overflow-y-auto border-4 border-red-500 items-start w-full select-none"
        )}
      >
        <WorkflowList />
      </div>
    </div>
  );
}
