import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/shared/PageHeader";
import { Stats } from "@/routes/_workspace_layout.dashboard/Stats";
import { DashboardTabs } from "@/routes/_workspace_layout.dashboard/DashboardTabs";

export default function () {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hidden">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your automation workflows."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </PageHeader>

      <Stats />

      <DashboardTabs />
    </div>
  );
}
