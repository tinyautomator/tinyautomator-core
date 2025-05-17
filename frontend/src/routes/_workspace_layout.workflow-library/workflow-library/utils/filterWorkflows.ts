import type { Workflow } from "../../route";
import type { SearchParams } from "./schemas";

interface WorkflowResult {
  workflows: Workflow[];
  tagCounts: Map<string, number>;
  statusCounts: Record<Workflow["status"], number>;
}

export function getWorkflowData(
  workflows: Workflow[],
  { q: searchQuery, tab: selectedTab, tags: selectedTags }: SearchParams
): WorkflowResult {
  // Early return for empty workflows
  if (!workflows.length) {
    return {
      workflows: [],
      tagCounts: new Map(),
      statusCounts: {} as Record<Workflow["status"], number>,
    };
  }

  // Pre-compute search query once
  const query = searchQuery?.toLowerCase();
  const hasTags = selectedTags.length > 0;

  const tagCounts = new Map<string, number>();
  const statusCounts = {} as Record<Workflow["status"], number>;
  const filteredWorkflows: Workflow[] = [];

  // Single pass through workflows
  for (const workflow of workflows) {
    // Skip if doesn't match tags
    if (hasTags && !selectedTags.some((tag) => workflow.tags.includes(tag)))
      continue;

    // Skip if doesn't match search
    if (query && query !== "") {
      const title = workflow.title.toLowerCase();
      const description = workflow.description.toLowerCase();
      const matches =
        title.includes(query) ||
        description.includes(query) ||
        workflow.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!matches) continue;
    }

    // If we get here, the workflow matches search and tags
    // Count its status
    statusCounts[workflow.status] = (statusCounts[workflow.status] ?? 0) + 1;

    // Skip if doesn't match tab
    if (selectedTab !== workflow.status) continue;

    // If we get here, the workflow passed all filters
    filteredWorkflows.push(workflow);

    // Update tag counts for filtered workflows
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
