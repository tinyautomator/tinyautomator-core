import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkflowRun } from "@/api/workflow/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

function RecentRun({ run }: { run: WorkflowRun }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between rounded-md border p-3"
      onClick={() => {
        navigate(`/workflow/${run.workflow_id}/run/${run.workflow_run_id}`);
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            run.status === "running"
              ? "bg-yellow-500"
              : run.status === "success"
                ? "bg-green-500"
                : "bg-red-500"
          )}
        ></div>
        <div>
          <p className="font-medium">{run.workflow_name}</p>
          <p className="text-xs text-muted-foreground">{run.status}</p>
          <p className="text-xs text-muted-foreground">{run.finished_at}</p>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{run.created_at}</div>
    </div>
  );
}

export function Recent({
  userWorkflowRuns,
}: {
  userWorkflowRuns: WorkflowRun[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workflow Runs</CardTitle>
        <CardDescription>
          History of your workflow executions in the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {userWorkflowRuns.map((run) => (
            <RecentRun key={run.workflow_run_id} run={run} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
