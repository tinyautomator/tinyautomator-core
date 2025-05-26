import {
  WORKFLOW_STATUS_CONFIG,
  WorkflowStatus,
  STATUS_BADGE_BASE,
  STATUS_BADGE_ICON,
  STATUS_BADGE_TEXT,
  STATUS_BADGE_ICON_INNER,
  GROUP_HOVER_OPACITY_ZERO,
  GROUP_HOVER_OPACITY_FULL,
} from "./workflow-card.styles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: WorkflowStatus;
}

export function WorkflowStatusBadge({ status }: StatusBadgeProps) {
  const config = WORKFLOW_STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        GROUP_HOVER_OPACITY_ZERO,
        STATUS_BADGE_BASE,
        config.bgColor,
        config.textColor,
      )}
    >
      <div
        className={cn(
          STATUS_BADGE_ICON,
          `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`,
        )}
      >
        <config.icon className={STATUS_BADGE_ICON_INNER} />
      </div>
      <span className={STATUS_BADGE_TEXT}>{status}</span>
    </div>
  );
}

interface WorkflowDescriptionProps {
  description?: string;
}

export function WorkflowDescription({ description }: WorkflowDescriptionProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center z-20 min-h-0",
        GROUP_HOVER_OPACITY_FULL,
        "pointer-events-none",
      )}
    >
      <p
        className={cn(
          "w-3/4 mx-auto",
          "text-xs line-clamp-3 text-center font-normal drop-shadow-sm",
          "text-slate-700 dark:text-slate-200",
        )}
      >
        {description || "No description provided"}
      </p>
    </div>
  );
}
interface WorkflowTagsProps {
  tags: string[];
  className?: string;
}

export function WorkflowTags({ tags, className }: WorkflowTagsProps) {
  return (
    <div
      className={cn(
        "min-h-min max-h-9 flex flex-wrap gap-2 rounded-lg overflow-hidden line-clamp-1",
        className,
      )}
    >
      {tags.slice(0, 3).map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn(
            "text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl",
          )}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
