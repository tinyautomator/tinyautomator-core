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
} from "./utils/library.styles";
import { WORKFLOW_STATUSES, WorkflowStatus } from "./utils/schemas";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function WorkflowTabs() {
  const { currentTab, updateState } = useWorkflowListState();
  const { statusCounts: counts } = useFilteredWorkflows();

  const handleTabChange = (value: WorkflowStatus) => {
    updateState({ tab: value });
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => handleTabChange(value as WorkflowStatus)}
      className={BORDER_STYLES}
    >
      <ScrollArea>
        <TabsList className={TABS_LIST_STYLES}>
          {WORKFLOW_STATUSES.map((tabValue) => (
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
                  COUNTER_STYLES
                )}
              >
                {counts[tabValue] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
