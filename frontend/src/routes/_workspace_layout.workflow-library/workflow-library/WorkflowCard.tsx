import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Archive,
  Play,
  Clock,
} from "lucide-react";
import type { Workflow } from "../route";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NodeCounter } from "./Counters";

const STATUS_STYLES = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  templates: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
} as const;

interface WorkflowCardProps {
  workflow: Workflow;
  onConfigure: (id: number) => void;
  onDelete: (workflow: Workflow) => void;
  onChangeStatus: (
    workflow: Workflow,
    newStatus: "active" | "archived"
  ) => void;
}

export function WorkflowCard({
  workflow,
  onConfigure,
  onDelete,
  onChangeStatus,
}: WorkflowCardProps) {
  const isArchived = workflow.status === "archived";
  const timeAgo = formatDistanceToNow(new Date(workflow.lastEdited), {
    addSuffix: true,
  });

  const actions = [
    {
      label: "Edit",
      icon: Edit2,
      onClick: () => onConfigure(workflow.id),
      show: !isArchived,
      quick: true,
      className:
        "h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 active:translate-y-0.5",
      iconClassName: "h-4 w-4 text-slate-600 dark:text-slate-400",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => onDelete(workflow),
      show: !isArchived,
      quick: true,
      className:
        "h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/30 active:translate-y-0.5",
      iconClassName: "h-4 w-4 text-red-500 dark:text-red-400",
    },
    {
      label: "Pause",
      icon: Clock,
      onClick: () => {},
      show: workflow.status === "active",
      quick: false,
    },
    {
      label: "Restore",
      icon: Play,
      onClick: () => onChangeStatus(workflow, "active"),
      show: isArchived,
      quick: false,
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: () => onChangeStatus(workflow, "archived"),
      show: !isArchived && workflow.status !== "draft",
      quick: false,
    },
  ].filter((action) => action.show);

  const quickActions = actions.filter((action) => action.quick);
  const dropdownActions = actions;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group",
        isArchived && "opacity-75 grayscale border-dashed"
      )}
    >
      <div className="p-5 flex-1 relative">
        <div className="flex justify-between items-start mb-2">
          <Badge className={cn(STATUS_STYLES[workflow.status], "capitalize")}>
            {workflow.status}
          </Badge>

          <div className="flex items-center gap-1">
            {quickActions.map(
              ({ label, icon: Icon, onClick, className, iconClassName }) => (
                <TooltipProvider key={label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          className,
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        )}
                        onClick={onClick}
                      >
                        <Icon className={iconClassName} />
                        <span className="sr-only">{label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label} workflow</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            )}

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 active:translate-y-0.5"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-56">
                {dropdownActions.map(
                  ({ label, icon: Icon, onClick, iconClassName }) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={onClick}
                      className={cn(
                        label === "Delete" &&
                          "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/30 data-[highlighted]:text-red-500 dark:data-[highlighted]:text-red-400"
                      )}
                    >
                      <Icon className={iconClassName} />
                      {label}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3
          className={cn(
            "text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1",
            isArchived && "text-slate-500 dark:text-slate-400"
          )}
        >
          {workflow.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
          {workflow.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {workflow.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={cn(
                "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium py-1 px-2.5 transition-colors duration-200 cursor-pointer",
                isArchived && "opacity-70"
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 py-3 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <NodeCounter count={workflow.nodeCount} />
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
