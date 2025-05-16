import {
  Search,
  Archive,
  FileText,
  PlusCircle,
  BlocksIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useValidatedSearchParams } from "./utils/schemas";
import { useNavigate } from "react-router";

type StateContent = {
  title: string;
  description: string;
  icon: typeof Search;
};
// TODO: Refactor
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
    default:
      return {
        title: "No workflows found",
        description: "Create your first workflow to get started",
        icon: FileText,
      };
  }
};

export function EmptyState() {
  const navigate = useNavigate();
  const [params] = useValidatedSearchParams();
  const { q: searchQuery, tab: selectedTab } = params;

  const state = getContent(searchQuery, selectedTab);
  const Icon = state.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 mb-4">
        <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {state.title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {state.description}
      </p>
      {!searchQuery &&
        selectedTab !== "archived" &&
        selectedTab !== "templates" && (
          <Button
            onClick={() => navigate("/workflow-builder")}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:translate-y-0.5 transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            Create Workflow
          </Button>
        )}
    </div>
  );
}
