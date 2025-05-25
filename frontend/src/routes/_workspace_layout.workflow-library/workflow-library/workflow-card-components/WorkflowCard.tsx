import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ButtonsOnHover } from "./ButtonsOnHover";
import { WorkflowActions } from "./WorkflowActions";
import { WorkflowDescription } from "./WorkflowDescription";
import { WorkflowFooter } from "./WorkflowFooter";
import { WorkflowNodeCount } from "./WorkflowNodeCount";
import { WorkflowStatusBadge } from "./WorkflowStatusDisplay";
import { WorkflowTags } from "./WorkflowTags";
import { WorkflowTitle } from "./WorkflowTitle";
import { GROUP_HOVER_OPACITY_ZERO } from "./workflow-card.constants";
import { WorkflowCardProps } from "./workflow-card.types";
import { DeleteWorkflowDialog } from "./DeleteWorkflowDialog";
import { useState } from "react";

export function WorkflowCard({
  workflow,
  onConfigure,
  onChangeStatus,
  onRunWorkflow,
}: Omit<WorkflowCardProps, "onDelete">) {
  const isArchived = workflow.status === "archived";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      // TODO: Implement delete API call
      // Remove the navigation refresh
    } catch (error) {
      console.error("Error deleting workflow:", error);
    }
  };

  return (
    <Card
      className={cn(
        "relative grid rounded-xl p-2 h-full",
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
          onDelete={() => setShowDeleteDialog(true)}
          onArchive={() => onChangeStatus(workflow, "archived")}
          onRestore={() => onChangeStatus(workflow, "active")}
        />
      </div>

      <WorkflowTitle
        title={workflow.title}
        isArchived={isArchived}
        isFavorite={workflow.isFavorite}
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
      <DeleteWorkflowDialog
        workflow={workflow}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          handleDelete();
          setShowDeleteDialog(false);
        }}
      />
    </Card>
  );
}
