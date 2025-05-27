import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import { Stats } from "@/routes/_workspace_layout.dashboard/Stats";
import { DashboardTabs } from "@/routes/_workspace_layout.dashboard/DashboardTabs";
import { workflowApi } from "@/api";
import { Route } from "./+types/route";
import { NavLink } from "react-router";

export async function loader() {
  const userWorkflows = await workflowApi.getUserWorkflows();
  const userWorkflowRuns = await workflowApi.getUserWorkflowRuns();
  return { userWorkflows, userWorkflowRuns };
}

export default function ({
  loaderData: { userWorkflows, userWorkflowRuns },
}: Route.ComponentProps) {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Dashboard
          </h3>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your automation workflows.
          </p>
        </div>
        <NavLink to="/workflow-builder" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </NavLink>
      </div>

      <Stats />

      <DashboardTabs
        userWorkflows={userWorkflows}
        userWorkflowRuns={userWorkflowRuns}
      />
    </div>
  );
}
