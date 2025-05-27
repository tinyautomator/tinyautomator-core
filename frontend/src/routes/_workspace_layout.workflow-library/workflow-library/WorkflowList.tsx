import { WorkflowCard, WorkflowCardSkeleton } from "./workflow-card-components";
import { useNavigation } from "react-router";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ArchiveWorkflowDialog } from "./workflow-card-components/ArchiveWorkflowDialog";
import type { Workflow } from "../route";
import type { WorkflowListProps } from "./workflow-card-components/workflow-card.types";

export function WorkflowList({
  workflows,
  emptyState,
  gridClassName,
  pagination,
}: WorkflowListProps) {
  const navigation = useNavigation();
  const [archivingWorkflow, setArchivingWorkflow] = useState<Workflow | null>(
    null,
  );

  const [showLoading] = useDebounce(navigation.state !== "idle", 150);

  if (workflows.length === 0 && !showLoading) {
    return emptyState;
  }

  return (
    <div className={cn("flex flex-col h-full")}>
      <div className={cn("overflow-hidden flex flex-col items-center")}>
        <div className={gridClassName}>
          {showLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <WorkflowCardSkeleton key={i} />
              ))
            : workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  setArchivingWorkflow={setArchivingWorkflow}
                />
              ))}
        </div>
      </div>
      {pagination}
      <ArchiveWorkflowDialog
        workflow={archivingWorkflow}
        isArchiving={archivingWorkflow !== null}
        setArchivingWorkflow={setArchivingWorkflow}
      />
    </div>
  );
}
