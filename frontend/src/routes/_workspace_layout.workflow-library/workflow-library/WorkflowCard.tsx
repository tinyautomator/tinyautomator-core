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
  Star,
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
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    <Card
      className={cn(
        "w-full h-[260px] p-6 rounded-2xl transition-all duration-300 overflow-hidden relative bg-white border border-slate-200",
        "shadow-md hover:shadow-lg hover:border-blue-200",
        "flex flex-col group",
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

      {/* Header section */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start">
          <button className="mr-2 text-xl text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer">
            <Star className="h-5 w-5" />
          </button>
          <h3
            className={cn(
              "font-bold text-lg text-slate-800 line-clamp-2 pr-2 hover:text-blue-600 cursor-pointer",
              isArchived && "text-slate-500"
            )}
            onClick={() => onConfigure(workflow.id)}
          >
            {workflow.title}
          </h3>
        </div>
      </div>

      {/* Status and node count */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
            STATUS_STYLES[workflow.status as WorkflowStatus].bg,
            STATUS_STYLES[workflow.status as WorkflowStatus].text
          )}
        >
          <Circle
            className={cn(
              "h-3 w-3",
              STATUS_STYLES[workflow.status as WorkflowStatus].icon
            )}
          />
          <span className="capitalize">{workflow.status}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                <i className="fa-solid fa-diagram-project mr-1.5"></i>
                {workflow.nodeCount}{" "}
                {workflow.nodeCount === 1 ? "Node" : "Nodes"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total nodes in workflow</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Description section */}
      <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-grow">
        {workflow.description}
      </p>

      {/* Tags section */}
      <div className="flex flex-wrap gap-2 mb-2">
        {workflow.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs py-1 px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {tag}
          </Badge>
        ))}
        {workflow.tags.length > 3 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="text-xs py-1 px-2.5 bg-slate-50 text-slate-500 border-slate-200"
                >
                  +{workflow.tags.length - 3} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  {workflow.tags.slice(3).map((tag) => (
                    <p key={tag} className="text-sm">
                      {tag}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Progress bar for Success Rate */}
      {typeof workflow.successRate === "number" && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">
              Success Rate
            </span>
            <span className="text-xs font-bold text-slate-700">
              {Math.round(workflow.successRate * 100)}%
            </span>
          </div>
          <Progress
            value={workflow.successRate * 100}
            className="h-2 bg-slate-100"
          />
        </div>
      )}

      {/* Footer section */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>Updated {timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Quick action buttons on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-3 pt-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="default"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-7"
            onClick={() => onConfigure(workflow.id)}
          >
            <Settings className="h-3 w-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs h-7"
            onClick={() => {}}
          >
            <Play className="h-3 w-3 mr-1" /> Run
          </Button>
        </div>
      </div>
    </Card>
  );
}
