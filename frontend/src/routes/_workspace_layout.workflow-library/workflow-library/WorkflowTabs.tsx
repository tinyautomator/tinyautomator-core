import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { useOptimisticParamValue } from "./hooks/useOptimisticParamValue";
import { Counter } from "./Counters";
import { Tab, TAB_VALUES } from "./utils/schemas";

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
      className="border-b border-slate-100 dark:border-slate-800"
    >
      <TabsList className="h-12 rounded-none border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        {/* TODO: Fix styling of tabs */}
        {TAB_VALUES.map((tabValue) => (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 gap-2"
          >
            {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
            <Counter count={counts[tabValue] ?? 0} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
