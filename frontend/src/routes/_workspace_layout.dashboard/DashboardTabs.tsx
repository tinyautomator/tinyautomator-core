import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowCard } from "@/routes/_workspace_layout.dashboard/WorkFlowCard";
import { Recent } from "@/routes/_workspace_layout.dashboard/Recent";
import { Workflow, WorkflowRun } from "@/api/workflow/types";

export function DashboardTabs({
  userWorkflows,
  userWorkflowRuns,
}: {
  userWorkflows: Workflow[];
  userWorkflowRuns: WorkflowRun[];
}) {
  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active Workflows</TabsTrigger>
        <TabsTrigger value="recent">Recent Runs</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userWorkflows?.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              id={workflow.id}
              name={workflow.name}
              description={workflow.description}
              lastRun={workflow.created_at}
              status={workflow.status}
              runs={0}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recent">
        <Recent userWorkflowRuns={userWorkflowRuns} />
      </TabsContent>
    </Tabs>
  );
}
