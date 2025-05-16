import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabCounter } from "./Counters";
import { Tab, TAB_VALUES } from "./utils/schemas";

interface WorkflowTabsProps {
  selectedTab: Tab;
  onTabChange: (tab: Tab) => void;
  counts: Record<Tab, number>;
}

export function WorkflowTabs({
  selectedTab,
  onTabChange,
  counts,
}: WorkflowTabsProps) {
  return (
    <div className="px-8 pt-6 pb-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs
          value={selectedTab}
          onValueChange={(value) => onTabChange(value as Tab)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-4 p-1 bg-slate-100 dark:bg-slate-800">
            {TAB_VALUES.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex items-center justify-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <TabCounter count={counts[tab] || 0} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
