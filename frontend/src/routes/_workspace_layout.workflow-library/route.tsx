import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workflowApi } from "@/api";
import { WorkflowTabs } from "./workflow-library/WorkflowTabs";
import { useMemo } from "react";
import { useValidatedSearchParams } from "./workflow-library/utils/schemas";
import { filterWorkflows } from "./workflow-library/utils/filterWorkflows";
import { WorkflowList } from "./workflow-library/WorkflowList";
import { WorkflowFilters } from "./workflow-library/WorkflowFilters";
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
}
// TODO: implement refetching of workflows periodically?
export async function loader() {
  const data = await workflowApi.getUserWorkflows();
  const mappedData = data.map((workflow) => ({
    id: workflow.id,
    title: workflow.name,
    description: workflow.description,
    lastEdited: new Date().toISOString(),
    status: "active" as const,
    nodeCount: 20,
    tags: ["type", "script", "paid"],
  }));

  // TODO: remove this once we update workflow schema
  return [...mappedData, ...sampleWorkflows];
}

export default function WorkflowLibrary({
  loaderData: workflows,
}: {
  loaderData: Workflow[];
}) {
  const [params, updateParams] = useValidatedSearchParams();
  const { q: searchQuery, tab: selectedTab, tags: selectedTags } = params;

  const filteredWorkflows = useMemo(
    () => filterWorkflows(workflows, params),
    [workflows, params]
  );

  const workflowCounts = useMemo(() => {
    const counts = {} as Record<Workflow["status"], number>;
    workflows.forEach((w) => {
      counts[w.status] = (counts[w.status] ?? 0) + 1;
    });
    return counts;
  }, [workflows]);

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-950 rounded-xl max-w-7xl mx-auto my-8 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Workflow Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and organize your automated workflows
          </p>
        </div>
        {/* TODO: use shared create workflow button */}
        <Button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white transition-colors duration-200 active:translate-y-0.5">
          <PlusCircleIcon className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <WorkflowTabs
          selectedTab={selectedTab}
          onTabChange={(tab) => updateParams({ tab })}
          counts={workflowCounts}
        />

        <div className="flex-1 flex flex-col">
          <WorkflowFilters
            searchQuery={searchQuery ?? ""}
            setSearchQuery={(q) => updateParams({ q })}
            tagsFilter={selectedTags}
            setTagsFilter={(tags: string[]) => updateParams({ tags })}
            showStatusFilter={selectedTab !== "templates"}
            workflows={workflows}
          />

          <WorkflowList workflows={filteredWorkflows} />
        </div>
      </div>
    </div>
  );
}
