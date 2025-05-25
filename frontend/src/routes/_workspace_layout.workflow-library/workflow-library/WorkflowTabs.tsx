import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { useOptimisticParamValue } from "./hooks/useOptimisticParamValue";
import { Counter } from "./Counters";
import { Tab, TAB_VALUES } from "./utils/schemas";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkflowTabs() {
  const [{ tab }, updateParams] = useValidatedSearchParams();
  const { statusCounts: counts } = useFilteredWorkflows();
  const [activeTab, setActiveTab] = useOptimisticParamValue(tab);

  const handleTabChange = (value: Tab) => {
    setActiveTab(value as Tab);
    updateParams({ tab: value as Tab });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value: string) => handleTabChange(value as Tab)}
      className="border-b border-slate-100 dark:border-slate-800 select-none"
    >
      <ScrollArea>
        <TabsList className="h-12 rounded-none border-b border-slate-100 dark:border-slate-800 bg-transparent mb-3 gap-1">
          {TAB_VALUES.map((tabValue) => (
            <TabsTrigger
              key={tabValue}
              value={tabValue}
              className={cn(
                "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none",
                "data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900 ",
                "data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100"
              )}
            >
              <List
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
              <Counter
                count={counts[tabValue] ?? 0}
                className={cn("bg-white dark:bg-slate-900")}
              />
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tabs>
  );
}
