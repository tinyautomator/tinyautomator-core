import { WorkflowStatus } from "../utils/schemas";
import { LucideIcon } from "lucide-react";

export interface WorkflowCardProps {
  workflow: Workflow;
  onDelete?: (id: number) => void;
}

export interface Workflow {
  id: number;
  title: string;
  description: string;
  lastEdited: string;
  status: WorkflowStatus;
  created_at: string;
  updated_at: string;
  nodeCount: number;
  tags: string[];
  isFavorite: boolean;
}

export interface WorkflowActionsProps {
  status: WorkflowStatus;
  workflowId: number;
  onEdit: (id: number) => void;
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
