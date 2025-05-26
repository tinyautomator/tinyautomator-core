import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Settings, Trash2, Play, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ACTION_BUTTON_BASE,
  ACTION_BUTTON_ICON,
  ACTION_MENU_ITEM_ICON,
  ACTION_MENU_ITEM_DANGER,
  ACTION_MENU_ITEM_DEFAULT,
} from "./workflow-card.styles";
import { useWorkflowActions } from "../hooks/useWorkflowActions";
import type { Workflow } from "../../route";

interface WorkflowActionsHoverProps {
  workflow: Workflow;
}

export function WorkflowActionsHover({ workflow }: WorkflowActionsHoverProps) {
  const { handleEdit, handleRun } = useWorkflowActions(workflow);

  return (
    <div className="absolute left-0 right-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-white/95 to-transparent px-5 pt-10 pb-5 gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-blue-700 hover:bg-blue-50 pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit();
        }}
      >
        <Settings className="h-3.5 w-3.5 mr-1.5" /> Edit
      </Button>
      <Button
        size="sm"
        variant="default"
        className="flex-1 bg-blue-600 hover:bg-blue-700 pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          handleRun();
        }}
      >
        <Play className="h-3.5 w-3.5 mr-1.5" /> Run
      </Button>
    </div>
  );
}

interface WorkflowActionsDropdownProps {
  status: Workflow["status"];
  workflowId: number;
}

export function WorkflowActionsDropdown({
  status,
  workflowId,
}: WorkflowActionsDropdownProps) {
  const { handleEdit, handleDelete, handleArchive, handleRestore } =
    useWorkflowActions({ id: workflowId, status } as Workflow);
  const isArchived = status === "archived";

  const actions = [
    {
      label: "Edit",
      icon: Settings,
      onClick: handleEdit,
      show: !isArchived,
      className: ACTION_MENU_ITEM_DEFAULT,
      iconClassName: ACTION_MENU_ITEM_ICON,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      show: !isArchived,
      className: ACTION_MENU_ITEM_DANGER,
      iconClassName: ACTION_MENU_ITEM_ICON,
      variant: "danger" as const,
    },

    {
      label: "Restore",
      icon: Play,
      onClick: handleRestore,
      show: isArchived,
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: handleArchive,
      show: !isArchived && status !== "draft",
    },
  ].filter((action) => action.show);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            ACTION_BUTTON_BASE,
            "opacity-0 group-hover:opacity-100",
          )}
        >
          <MoreHorizontal className={ACTION_BUTTON_ICON} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className={action.className}
          >
            <action.icon className={action.iconClassName} />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
