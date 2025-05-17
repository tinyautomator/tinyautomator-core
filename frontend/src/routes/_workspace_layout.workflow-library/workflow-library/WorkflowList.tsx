import { useState } from "react";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { WorkflowCard } from "./WorkflowCard";
import { DeleteWorkflowDialog } from "./DeleteWorkflowDialog";
import { useNavigate } from "react-router";
import type { Workflow } from "../route";
import { EmptyState } from "./EmptyState";

export function WorkflowList() {
  const { workflows } = useFilteredWorkflows();
  const navigate = useNavigate();
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(
    null
  );

  const handleDelete = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
  };

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    // TODO: Implement delete API call
    console.log("Deleting workflow:", workflowToDelete.id);
    setWorkflowToDelete(null);
  };

  const handleConfigure = (id: number) => {
    navigate(`/workflow-builder/${id}`);
  };

  const handleChangeStatus = (
    workflow: Workflow,
    newStatus: "active" | "archived"
  ) => {
    console.log(`Changing status of workflow ${workflow.id} to ${newStatus}`);
    // TODO: Implement status change
  };

  if (workflows.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onConfigure={() => handleConfigure(workflow.id)}
            onDelete={() => handleDelete(workflow)}
            onChangeStatus={handleChangeStatus}
          />
        ))}
      </div>

      <DeleteWorkflowDialog
        workflow={workflowToDelete}
        open={!!workflowToDelete}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
