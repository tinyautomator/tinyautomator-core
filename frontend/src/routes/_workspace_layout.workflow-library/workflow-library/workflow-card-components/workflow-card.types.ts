export type WorkflowStatus = "active" | "draft" | "archived" | "templates";

export interface WorkflowAction {
  label: string;
  icon: any;
  onClick: () => void;
  show: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "danger";
}

export interface WorkflowActionsProps {
  status: WorkflowStatus;
  workflowId: number;
  onEdit: (id: number) => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export interface WorkflowCardProps {
  workflow: any;
  onConfigure: (id: number) => void;
  onChangeStatus: (workflow: any, newStatus: "active" | "archived") => void;
  onRunWorkflow: (workflow: any) => void;
}
