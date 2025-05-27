import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  WorkflowActionsDropdown,
  WorkflowActionsHover,
} from "./WorkflowActions";
import {
  WorkflowDescription,
  WorkflowStatusBadge,
  WorkflowTags,
} from "./WorkflowBody";
import { WorkflowFooter } from "./WorkflowFooter";
import { WorkflowTitle } from "./WorkflowHeader";
import { Workflow, WorkflowCardProps } from "./workflow-card.types";
import {
  CARD_BASE_STYLES,
  CARD_ACTION_BUTTON_STYLES,
  CARD_CONTENT_STYLES,
  CARD_FOOTER_STYLES,
  TRUNCATE_STYLES,
  GROUP_HOVER_OPACITY_ZERO,
} from "./workflow-card.styles";
import { Dispatch, SetStateAction } from "react";

export function WorkflowCard({
  workflow,
  setArchivingWorkflow,
}: Omit<WorkflowCardProps, "onDelete"> & {
  setArchivingWorkflow: Dispatch<SetStateAction<Workflow | null>>;
}) {
  const isArchived = workflow.status === "archived";

  return (
    <Card className={CARD_BASE_STYLES}>
      <div className={CARD_ACTION_BUTTON_STYLES}>
        <WorkflowActionsDropdown
          workflow={workflow}
          setArchivingWorkflow={setArchivingWorkflow}
        />
      </div>

      <WorkflowTitle
        title={workflow.title}
        isArchived={isArchived}
        workflow={workflow}
      />

      <div
        className={cn(
          CARD_CONTENT_STYLES,
          GROUP_HOVER_OPACITY_ZERO,
          "hover:opacity-100"
        )}
      >
        <WorkflowStatusBadge status={workflow.status} />
      </div>

      <WorkflowTags
        tags={workflow.tags}
        className={cn(TRUNCATE_STYLES, GROUP_HOVER_OPACITY_ZERO)}
      />
      <div className="w-full">
        <div
          className={cn(
            CARD_FOOTER_STYLES,
            GROUP_HOVER_OPACITY_ZERO,
            "justify-end"
          )}
        >
          <WorkflowFooter lastEdited={new Date(workflow.lastEdited)} />
        </div>
      </div>
      <WorkflowDescription description={workflow.description} />
      <WorkflowActionsHover workflow={workflow} />
    </Card>
  );
}

export function WorkflowCardSkeleton() {
  return (
    <div
      className={cn(
        // Card container styling to match real WorkflowCard
        "relative grid rounded-xl p-2",
        "bg-white dark:bg-slate-900",
        "border-2 border-slate-300 dark:border-slate-800",
        "shadow-[0_2px_4px_rgba(0,0,0,0.05)]",
        "transition-all duration-300",
        "group overflow-hidden w-full min-w-0"
      )}
      style={{ minHeight: 180 }} // Ensures consistent card height
    >
      {/* Actions skeleton (top right, appears on hover in real card) */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-6 w-6 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      {/* Title skeleton (star icon absolute left, title centered) */}
      <div className="flex items-center rounded-lg w-full justify-center relative mb-2">
        <div className="mr-2 text-xl absolute left-1">
          <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-6 w-3/5 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      {/* Status badge skeleton */}
      <div className="flex items-center justify-between min-w-0 min-h-0 mb-2">
        <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      {/* Tags skeleton */}
      <div className="flex flex-wrap gap-2 rounded-lg overflow-hidden mb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-5 w-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      {/* Node count and footer skeleton */}
      <div className="w-full mb-2">
        <div className="flex justify-between items-center gap-2 w-full">
          <div className="h-6 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      {/* Description skeleton (centered overlay, mimics real card's description) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 min-h-0 pointer-events-none">
        <div className="text-xs line-clamp-2 text-center font-normal drop-shadow-sm text-slate-700 dark:text-slate-200">
          <div className="h-4 w-3/4 mx-auto animate-pulse rounded bg-slate-100 dark:bg-slate-800 mb-1" />
          <div className="h-4 w-1/2 mx-auto animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      {/* Buttons on hover skeleton (bottom center, appears on hover in real card) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <div className="h-8 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-8 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}
