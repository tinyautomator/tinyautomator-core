import { Search, Archive, FileText, BlocksIcon } from "lucide-react";

import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { useValidatedSearchParams } from "./hooks/useSearchParams";

type StateContent = {
  title: string;
  description: string;
  icon: typeof Search;
};
// TODO: Refactor icons to be more specific
const getContent = (query?: string, tab?: string): StateContent => {
  if (query) {
    return {
      title: `No results found for "${query}"`,
      description: "Try adjusting your search or filters",
      icon: Search,
    };
  }

  switch (tab) {
    case "templates":
      return {
        title: "No templates available",
        description: "Create a template to get started",
        icon: BlocksIcon,
      };
    case "archived":
      return {
        title: "No archived workflows",
        description: "Archived workflows will appear here",
        icon: Archive,
      };
    case "draft":
      return {
        title: "No drafted workflows",
        description: "Drafted workflows will appear here",
        icon: FileText,
      };
    default:
      return {
        title: "No active workflows found",
        description: "Create your first workflow to get started",
        icon: FileText,
      };
  }
};

export function EmptyState() {
  const [{ q: searchQuery, tab: selectedTab }] = useValidatedSearchParams();
  const state = getContent(searchQuery, selectedTab);
  const Icon = state.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-4">
        <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-xl capitalize font-semibold text-slate-900 dark:text-white mb-2">
        {state.title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {state.description}
      </p>
      {!searchQuery &&
        selectedTab !== "archived" &&
        selectedTab !== "templates" && <CreateWorkflowButton />}
    </div>
  );
}
