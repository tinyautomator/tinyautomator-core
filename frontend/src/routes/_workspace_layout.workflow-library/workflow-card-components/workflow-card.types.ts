import { LucideIcon } from "lucide-react";
import { Workflow } from "@/api";

export interface WorkflowCardProps {
  workflow: Workflow;
  onDelete?: (id: Workflow["id"]) => void;
}

export interface WorkflowActionsProps {
  status: Workflow["status"];
  workflowId: Workflow["id"];
  onEdit: (id: Workflow["id"]) => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export interface WorkflowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  show: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "danger";
}

export interface WorkflowListProps {
  workflows: Workflow[];
  emptyState?: React.ReactNode;
  pagination?: React.ReactNode;
  gridClassName?: string;
}
