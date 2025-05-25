import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ButtonsOnHover } from "./workflow-card-components/ButtonsOnHover";
import { WorkflowActions } from "./workflow-card-components/WorkflowActions";
import { WorkflowDescription } from "./workflow-card-components/WorkflowDescription";
import { WorkflowFooter } from "./workflow-card-components/WorkflowFooter";
import { WorkflowNodeCount } from "./workflow-card-components/WorkflowNodeCount";
import { WorkflowStatusBadge } from "./workflow-card-components/WorkflowStatusDisplay";
import { WorkflowTags } from "./workflow-card-components/WorkflowTags";
import { WorkflowTitle } from "./workflow-card-components/WorkflowTitle";
import { GROUP_HOVER_OPACITY_ZERO } from "./workflow-card-components/workflow-card.constants";
import { WorkflowCardProps } from "./workflow-card-components/workflow-card.types";

export function WorkflowCard({
  workflow,
  onConfigure,
  onDelete,
  onChangeStatus,
  onRunWorkflow,
}: WorkflowCardProps) {
  const isArchived = workflow.status === "archived";

  return (
    <Card
      className={cn(
        "relative grid rounded-xl p-2",
        "bg-white dark:bg-slate-900",
        "border-2 border-slate-300 dark:border-slate-800",
        "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
        "transition-all duration-300",
        "hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)]",
        "hover:translate-y-[-2px]",
        "hover:border-slate-300 dark:hover:border-slate-700",
        "group overflow-hidden"
      )}
    >
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <WorkflowActions
          status={workflow.status}
          workflowId={workflow.id}
          onEdit={onConfigure}
          onDelete={() => onDelete(workflow)}
          onArchive={() => onChangeStatus(workflow, "archived")}
          onRestore={() => onChangeStatus(workflow, "active")}
        />
      </div>

      <WorkflowTitle
        title={workflow.title}
        isArchived={isArchived}
        onConfigure={() => onConfigure(workflow.id)}
      />

      <div
        className={cn(
          "flex items-center justify-between min-w-0 min-h-0",
          GROUP_HOVER_OPACITY_ZERO
        )}
      >
        <WorkflowStatusBadge status={workflow.status} />
      </div>

      <WorkflowTags
        tags={workflow.tags}
        className={cn("truncate min-w-0", GROUP_HOVER_OPACITY_ZERO)}
      />
      <div className="w-full">
        <div
          className={cn(
            "flex justify-between items-center gap-2 ",
            GROUP_HOVER_OPACITY_ZERO
          )}
        >
          <WorkflowNodeCount nodeCount={workflow.nodeCount} />
          <WorkflowFooter
            lastEdited={new Date(workflow.lastEdited)}
            className={cn("truncate min-w-0", GROUP_HOVER_OPACITY_ZERO)}
          />
        </div>
      </div>
      <WorkflowDescription description={workflow.description} />
      <ButtonsOnHover
        onEdit={() => onConfigure(workflow.id)}
        onRun={() => onRunWorkflow(workflow)}
      />
    </Card>
  );
}
