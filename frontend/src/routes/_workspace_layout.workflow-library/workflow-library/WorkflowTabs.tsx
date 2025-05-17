import { useValidatedSearchParams } from "./utils/schemas";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import type { Workflow } from "../route";

const TAB_VALUES = ["active", "draft", "templates", "archived"] as const;

export function WorkflowTabs() {
  const [{ tab }, updateParams] = useValidatedSearchParams();
  const { statusCounts: counts } = useFilteredWorkflows();

  return (
    <Tabs
      value={tab}
      onValueChange={(value) =>
        updateParams({ tab: value as Workflow["status"] })
      }
      className="border-b border-slate-100 dark:border-slate-800"
    >
      <TabsList className="h-12 rounded-none border-b border-slate-100 dark:border-slate-800 bg-transparent">
        {TAB_VALUES.map((tabValue) => (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800"
          >
            {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} (
            {counts[tabValue] ?? 0})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
