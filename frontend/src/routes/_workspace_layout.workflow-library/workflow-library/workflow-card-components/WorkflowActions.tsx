import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Settings,
  Trash2,
  PauseCircle,
  Play,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkflowActionsProps, WorkflowAction } from "./workflow-card.types";

export function WorkflowActions({
  status,
  workflowId,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: WorkflowActionsProps) {
  const isArchived = status === "archived";

  const actions: WorkflowAction[] = [
    {
      label: "Edit",
      icon: Settings,
      onClick: () => onEdit(workflowId),
      show: !isArchived,
      className: "hover:bg-slate-100 dark:hover:bg-slate-800",
      iconClassName: "text-slate-600 dark:text-slate-400",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      show: !isArchived,
      className: "hover:bg-red-50 dark:hover:bg-red-950/30",
      iconClassName: "text-red-500 dark:text-red-400",
      variant: "danger" as const,
    },
    {
      label: "Pause",
      icon: PauseCircle,
      onClick: () => {},
      show: status === "active",
    },
    {
      label: "Restore",
      icon: Play,
      onClick: onRestore,
      show: isArchived,
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: onArchive,
      show: !isArchived && status !== "draft",
    },
  ].filter((action) => action.show);

  const baseButtonStyles = cn(
    "h-7 w-7",
    "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
    "hover:bg-white dark:hover:bg-slate-900",
    "shadow-sm hover:shadow-md transition-all duration-200"
  );

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={baseButtonStyles}>
            <MoreHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom">
          {actions.map(
            ({ label, icon: Icon, onClick, className, iconClassName }) => (
              <DropdownMenuItem
                key={label}
                onClick={onClick}
                className={cn("flex items-center gap-2", className)}
              >
                <Icon className={cn("h-3.5 w-3.5", iconClassName)} />
                {label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
