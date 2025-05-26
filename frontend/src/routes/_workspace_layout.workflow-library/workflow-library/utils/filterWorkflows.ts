import type { Workflow } from "../../route";
import type { SearchParams } from "./schemas";

interface WorkflowResult {
  workflows: Workflow[];
  tagCounts: Map<string, number>;
  statusCounts: Record<Workflow["status"], number>;
}

export function getWorkflowData(
  workflows: Workflow[],
  { q: searchQuery, tab: selectedTab, tags: selectedTags }: SearchParams,
): WorkflowResult {
  if (!workflows.length) {
    return {
      workflows: [],
      tagCounts: new Map(),
      statusCounts: {} as Record<Workflow["status"], number>,
    };
  }

  const query = searchQuery?.toLowerCase();
  const hasTags = selectedTags.length > 0;

  const tagCounts = new Map<string, number>();
  const statusCounts = {} as Record<Workflow["status"], number>;
  const filteredWorkflows: Workflow[] = [];

  for (const workflow of workflows) {
    if (hasTags && !selectedTags.some((tag) => workflow.tags.includes(tag)))
      continue;

    if (query && query !== "") {
      const title = workflow.title.toLowerCase();
      const description = workflow.description.toLowerCase();
      const matches =
        title.includes(query) ||
        description.includes(query) ||
        workflow.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!matches) continue;
    }

    statusCounts[workflow.status] = (statusCounts[workflow.status] ?? 0) + 1;

    if (selectedTab !== workflow.status) continue;

    filteredWorkflows.push(workflow);

    workflow.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  }

  return {
    workflows: filteredWorkflows,
    tagCounts,
    statusCounts,
  };
}
