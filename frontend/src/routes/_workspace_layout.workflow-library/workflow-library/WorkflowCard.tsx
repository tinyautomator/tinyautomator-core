import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Archive,
  Play,
  Clock,
  Settings,
  PauseCircle,
  Circle,
  LucideIcon,
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

interface WorkflowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  show: boolean;
  quick: boolean;
  className?: string;
  iconClassName?: string;
  variant?: "danger" | undefined;
}

interface WorkflowActionsProps {
  status: WorkflowStatus;
  workflowId: number;
  onEdit: (id: number) => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

function WorkflowActions({
  status,
  workflowId,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: WorkflowActionsProps) {
  const isArchived = status === "archived";

  const actions = [
    {
      label: "Edit",
      icon: Settings,
      onClick: () => onEdit(workflowId),
      show: !isArchived,
      quick: true,
      className: "hover:bg-slate-100 dark:hover:bg-slate-800",
      iconClassName: "text-slate-600 dark:text-slate-400",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      show: !isArchived,
      quick: true,
      className: "hover:bg-red-50 dark:hover:bg-red-950/30",
      iconClassName: "text-red-500 dark:text-red-400",
      variant: "danger" as const,
    },
    {
      label: "Pause",
      icon: PauseCircle,
      onClick: () => {},
      show: status === "active",
      quick: false,
    },
    {
      label: "Restore",
      icon: Play,
      onClick: onRestore,
      show: isArchived,
      quick: false,
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: onArchive,
      show: !isArchived && status !== "draft",
      quick: false,
    },
  ].filter((action) => action.show) as WorkflowAction[];

  const quickActions = actions.filter((action) => action.quick);
  const menuActions = actions;

  const baseButtonStyles = cn(
    "h-7 w-7",
    "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
    "hover:bg-white dark:hover:bg-slate-900",
    "shadow-sm hover:shadow-md transition-all duration-200"
  );

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
      {quickActions.map(
        ({ label, icon: Icon, onClick, className, iconClassName, variant }) => (
          <TooltipProvider key={label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(baseButtonStyles, className)}
                  onClick={onClick}
                >
                  <Icon className={cn("h-3.5 w-3.5", iconClassName)} />
                  <span className="sr-only">{label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{label} workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      )}
      {menuActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={baseButtonStyles}>
              <MoreHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="left">
            {menuActions.map(({ label, icon: Icon, onClick, variant }) => (
              <DropdownMenuItem
                key={label}
                onClick={onClick}
                className={cn(
                  "flex items-center gap-2",
                  variant === "danger" &&
                    "text-red-500 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/30"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    variant === "danger" && "text-red-500 dark:text-red-400"
                  )}
                />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

type WorkflowStatus = "active" | "draft" | "archived" | "templates";

const STATUS_STYLES = {
  active: {
    icon: "text-emerald-500 fill-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  draft: {
    icon: "text-amber-500 fill-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  archived: {
    icon: "text-slate-400 fill-slate-400",
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
  },
  templates: {
    icon: "text-blue-500 fill-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
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

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800",
        "overflow-hidden flex flex-col group transition-all duration-200",
        "shadow-sm hover:shadow-md",
        "w-full h-[180px]",
        "relative",
        isArchived && "opacity-75 grayscale"
      )}
    >
      <WorkflowActions
        status={workflow.status as WorkflowStatus}
        workflowId={workflow.id}
        onEdit={onConfigure}
        onDelete={() => onDelete(workflow)}
        onArchive={() => onChangeStatus(workflow, "archived")}
        onRestore={() => onChangeStatus(workflow, "active")}
      />

      <div className="p-3 flex-1 relative flex flex-col">
        <div className="flex-1">
          <h3
            className={cn(
              "text-base font-semibold text-slate-900 dark:text-white mb-1.5",
              isArchived && "text-slate-500 dark:text-slate-400"
            )}
          >
            {workflow.title}
          </h3>

          <div className="mb-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {workflow.description}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {workflow.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-normal py-0.5 px-2 transition-colors duration-200 cursor-pointer whitespace-nowrap",
                    isArchived && "opacity-70"
                  )}
                >
                  {tag}
                </Badge>
              ))}
              {workflow.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-normal py-0.5 px-2"
                >
                  +{workflow.tags.length - 2} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Circle
                className={cn(
                  "h-3 w-3 transition-colors duration-200",
                  STATUS_STYLES[workflow.status as WorkflowStatus].icon,
                  workflow.status === "active" && "group-hover:animate-pulse"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium capitalize",
                  STATUS_STYLES[workflow.status as WorkflowStatus].text
                )}
              >
                {workflow.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-md px-2 py-1",
            STATUS_STYLES[workflow.status as WorkflowStatus].bg,
            "transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm"
          )}
        >
          <span
            className={cn(
              "text-base font-bold",
              STATUS_STYLES[workflow.status as WorkflowStatus].text
            )}
          >
            {workflow.nodeCount}
          </span>
          <span
            className={cn(
              "text-xs",
              STATUS_STYLES[workflow.status as WorkflowStatus].text
            )}
          >
            nodes
          </span>
        </div>
      </div>
    </div>
  );
}
