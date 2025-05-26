import { useNavigate } from "react-router";
import { useState } from "react";
import type { Workflow } from "../../route";

export function useWorkflowActions(workflow: Workflow) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    navigate(`/workflow-builder/${workflow.id}`);
  };

  const handleRun = () => {
    // Empty implementation
  };

  const handleArchive = () => {
    // Empty implementation
  };

  const handleRestore = () => {
    // Empty implementation
  };

  const handleDelete = () => {
    // Empty implementation
  };

  return {
    showDeleteDialog,
    setShowDeleteDialog,
    handleEdit,
    handleRun,
    handleArchive,
    handleRestore,
    handleDelete,
  };
}
