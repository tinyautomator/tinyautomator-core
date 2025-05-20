import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { WorkflowTabs } from "./workflow-library/WorkflowTabs";
import { WorkflowList } from "./workflow-library/WorkflowList";
import { WorkflowSearchBar } from "./workflow-library/WorkflowSearchBar";
import { ActiveTagFilters } from "./workflow-library/ActiveTagFilters";
import { sampleWorkflows } from "./workflow-library/utils/sampleWorkflows";

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

export default function WorkflowLibrary() {
  return (
    <div className="h-full p-4 overflow-hidden">
      <div className="h-full flex flex-col bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="shrink-0 p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Workflow Library
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and organize your automated workflows
            </p>
          </div>
          <CreateWorkflowButton />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="shrink-0">
            <WorkflowSearchBar />
          </div>
          <div className="shrink-0">
            <WorkflowTabs />
            <ActiveTagFilters />
          </div>
          <div className="flex-1 min-h-0">
            <WorkflowList />
          </div>
        </div>
      </div>
    </div>
  );
}
