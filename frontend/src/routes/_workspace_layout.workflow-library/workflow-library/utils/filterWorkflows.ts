import type { Workflow } from "../../route";
import type { SearchParams } from "./schemas";

export function filterWorkflows(
  workflows: Workflow[],
  { q: searchQuery, tab: selectedTab, tags: selectedTags }: SearchParams
): Workflow[] {
  // Early return for empty workflows
  if (!workflows.length) return [];

  // Pre-compute search query once
  const query = searchQuery?.toLowerCase();
  const hasTags = selectedTags.length > 0;

  // Single filter pass instead of multiple
  return workflows.filter((workflow) => {
    // Tab filtering
    if (selectedTab === "templates") return false; // TODO: Implement templates
    if (selectedTab === "draft" && workflow.status !== "draft") return false;
    if (selectedTab === "active" && workflow.status !== "active") return false;
    if (selectedTab === "archived" && workflow.status !== "archived")
      return false;

    // // Tag filtering
    // if (tagFilter && tagFilter !== "all") {
    //   if (!workflow.tags.includes(tagFilter)) return false;
    // }

    // Additional tag filtering from URL params
    if (hasTags && !selectedTags.some((tag) => workflow.tags.includes(tag)))
      return false;

    // Search filtering - only if we have a query
    if (query) {
      const title = workflow.title.toLowerCase();
      const description = workflow.description.toLowerCase();
      return (
        title.includes(query) ||
        description.includes(query) ||
        workflow.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });
}
