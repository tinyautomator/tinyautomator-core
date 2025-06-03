import { Stats } from "@/routes/_workspace_layout.dashboard/Stats";
import { DashboardTabs } from "@/routes/_workspace_layout.dashboard/DashboardTabs";
import { workflowApi } from "@/api";
import { Route } from "./+types/route";
import { CreateWorkflowButton } from "@/components/shared/CreatWorkflowButton";
import { getAuth } from "@clerk/react-router/ssr.server";

export async function loader(args: Route.LoaderArgs) {
  const { getToken } = await getAuth(args);
  const token = (await getToken()) as string;
  const userWorkflows = await workflowApi.getUserWorkflows(token);
  const userWorkflowRuns = await workflowApi.getUserWorkflowRuns(token);
  return { userWorkflows, userWorkflowRuns };
}

export default function Dashboard({
  loaderData: { userWorkflows },
}: Route.ComponentProps) {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hidden dark:bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h3>
          <p className="text-muted-foreground dark:text-white">
            Welcome back! Here's an overview of your automation workflows.
          </p>
        </div>
        <CreateWorkflowButton />
      </div>
      <Stats />
      <DashboardTabs userWorkflows={userWorkflows} />
    </div>
  );
}
