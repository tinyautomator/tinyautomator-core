import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { useWorkflowListState } from "./hooks/useWorkflowListState";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { List } from "lucide-react";
import {
  ACTIVE_TAB_STYLES,
  BORDER_STYLES,
  COUNTER_STYLES,
  TABS_LIST_STYLES,
  ICON_SPACING_STYLES,
} from "./utils/library-styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Workflow } from "@/api";

export function WorkflowTabs({ workflows }: { workflows: Workflow[] }) {
  const { currentTab, updateState } = useWorkflowListState();
  const { statusCounts: counts } = useFilteredWorkflows(workflows);

  const handleTabChange = (value: Workflow["status"]) => {
    updateState({ tab: value });
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => handleTabChange(value as Workflow["status"])}
      className={BORDER_STYLES}
    >
      <ScrollArea>
        <TabsList className={TABS_LIST_STYLES}>
          {["draft", "active", "archived"].map((tabValue) => (
            <TabsTrigger
              key={tabValue}
              value={tabValue}
              className={ACTIVE_TAB_STYLES}
            >
              <List
                className={ICON_SPACING_STYLES}
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="capitalize">{tabValue}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs font-normal bg-transparent border border-slate-200 dark:border-slate-700",
                  COUNTER_STYLES,
                )}
              >
                {counts[tabValue as Workflow["status"]] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
