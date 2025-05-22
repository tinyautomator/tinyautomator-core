import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  Archive,
  Play,
  Clock,
  Settings,
  PauseCircle,
  BadgeCheck,
  Workflow as WorkflowIcon,
  type LucideIcon,
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

interface WorkflowAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  show: boolean;
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
  ].filter((action) => action.show) as WorkflowAction[];

  const baseButtonStyles = cn(
    "h-7 w-7",
    "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
    "hover:bg-white dark:hover:bg-slate-900",
    "shadow-sm hover:shadow-md transition-all duration-200"
  );

  return (
    <div className=" flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
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

type WorkflowStatus = "active" | "draft" | "archived" | "templates";

const STATUS_STYLES = {
  active: {
    icon: "text-emerald-500 fill-emerald-700",
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

function WorkflowTitle({
  title,
  isArchived,
  onConfigure,
}: {
  title: string;
  isArchived: boolean;
  onConfigure: () => void;
}) {
  return (
    <div className="flex items-center w-full p-1 rounded-lg pr-10 mb-1 min-h-[48px] max-h-[48px]">
      <button className="flex-shrink-0 mr-2 text-xl text-slate-400 hover:text-yellow-400 transition-colors cursor-pointer">
        <Star className="h-5 w-5" />
      </button>
      <h3
        className={cn(
          "font-bold text-md pr-2 hover:text-blue-600 cursor-pointer w-full line-clamp-2 overflow-hidden text-ellipsis leading-tight",
          "text-balance",
          isArchived
            ? "text-slate-500 dark:text-slate-400"
            : "text-slate-800 dark:text-slate-200"
        )}
        onClick={onConfigure}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}

function WorkflowStatus({ status }: { status: WorkflowStatus }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium",
        STATUS_STYLES[status].bg,
        STATUS_STYLES[status].text
      )}
    >
      <BadgeCheck className={cn("h-4 w-4 mr-1", STATUS_STYLES[status].icon)} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

function WorkflowNodeCount({ nodeCount }: { nodeCount: number }) {
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="outline"
              className="flex items-center bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 h-7 text-xs px-2"
            >
              <WorkflowIcon className="h-4 w-4" />
              {nodeCount} {nodeCount === 1 ? "Node" : "Nodes"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total nodes in workflow</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function WorkflowDescription({ description }: { description?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <p className="text-sm text-slate-700 dark:text-slate-200 text-center font-normal drop-shadow-sm">
        {description || "No description provided"}
      </p>
    </div>
  );
}

function WorkflowTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 p-1 rounded-lg mb-1 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
      {tags.slice(0, 3).map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-xs py-1 px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function WorkflowFooter({ lastEdited }: { lastEdited: Date }) {
  const timeAgo = formatDistanceToNow(lastEdited, {
    addSuffix: true,
  });

  return (
    <div className="mt-auto p-1 rounded-lg opacity-100 group-hover:opacity-0 transition-opacity duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span>Updated {timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <Card
      className={cn(
        "flex flex-col h-3/4 p-2 rounded-2xl relative gap-2",
        "bg-white dark:bg-slate-900",
        "transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg group"
      )}
    >
      <div className="absolute top-2 right-2 z-30">
        <WorkflowActions
          status={workflow.status as WorkflowStatus}
          workflowId={workflow.id}
          onEdit={onConfigure}
          onDelete={() => onDelete(workflow)}
          onArchive={() => onChangeStatus(workflow, "archived")}
          onRestore={() => onChangeStatus(workflow, "active")}
        />
      </div>

      <WorkflowTitle
        title={workflow.title}
        isArchived={isArchived}
        onConfigure={() => onConfigure(workflow.id)}
      />

      <WorkflowDescription description={workflow.description} />

      <div className="flex items-center justify-between flex-wrap rounded-lg mb-1 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
        <WorkflowStatus status={workflow.status as WorkflowStatus} />
        <WorkflowNodeCount nodeCount={workflow.nodeCount} />
      </div>

      <WorkflowTags tags={workflow.tags} />

      <WorkflowFooter lastEdited={new Date(workflow.lastEdited)} />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-5 pt-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 pointer-events-auto"
            onClick={() => onConfigure(workflow.id)}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="default"
            className="flex-1 bg-blue-600 hover:bg-blue-700 pointer-events-auto"
            onClick={() => {}}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" /> Run
          </Button>
        </div>
      </div>
    </Card>
  );
}
