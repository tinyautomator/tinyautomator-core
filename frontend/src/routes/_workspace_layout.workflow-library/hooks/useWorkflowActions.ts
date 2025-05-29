import { useNavigate } from "react-router";
import type { Workflow } from "../route";
import { workflowApi } from "@/api";

export function useWorkflowActions(workflow: Workflow) {
  const navigate = useNavigate();
  const workflowId = workflow.id.toString();

  const handleEdit = () => {
    navigate(`/workflow-builder/${workflow.id}`);
  };

  const handleRun = () => {
    workflowApi.runWorkflow(workflowId);
    navigate(`/workflow/${workflowId}/run/${workflowId}`);
  };

  const handleArchive = () => {
    workflowApi.archiveWorkflow(workflowId);
  };

  const handleRestore = () => {
    // Empty implementation
  };

  const handleFavorite = () => {
    // Empty implementation
  };

  return {
    handleEdit,
    handleRun,
    handleArchive,
    handleRestore,
    handleFavorite,
  };
}
