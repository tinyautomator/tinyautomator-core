import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { WorkflowCard } from "./workflow-card-components/WorkflowCard";
import { WorkflowCardSkeleton } from "./WorkflowCardSkeleton";
import { useNavigation, useNavigate } from "react-router";
import { useDebounce } from "use-debounce";
import type { Workflow } from "../route";
import { EmptyState } from "./EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { useOptimisticParamValue } from "./hooks/useOptimisticParamValue";
import { cn } from "@/lib/utils";

function WorkflowPagination() {
  const { pagination } = useFilteredWorkflows();
  const [{ page }, updateParams] = useValidatedSearchParams(
    pagination.totalPages
  );
  const [, setCurrentPage] = useOptimisticParamValue(page);

  if (pagination.totalPages <= 1) return null;

  // Calculate the window of page numbers to show
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, page - halfWindow);
  const endPage = Math.min(pagination.totalPages, startPage + windowSize - 1);

  // Adjust the window if we're near the end
  if (endPage - startPage + 1 < windowSize) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateParams({ page: newPage });
  };

  const isFirstPage = page <= 1;
  const isLastPage = page >= pagination.totalPages;

  return (
    <Pagination>
      <PaginationContent className="select-none">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => !isFirstPage && handlePageChange(page - 1)}
            className={cn(isFirstPage && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        {pageNumbers.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => handlePageChange(pageNum)}
              isActive={pageNum === page}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => !isLastPage && handlePageChange(page + 1)}
            className={cn(isLastPage && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function WorkflowList() {
  const { workflows } = useFilteredWorkflows();
  const navigation = useNavigation();
  const navigate = useNavigate();

  // Debounce the loading state by 150ms to prevent flash
  const [showLoading] = useDebounce(navigation.state !== "idle", 150);

  const handleConfigure = (id: number) => {
    navigate(`/workflow-builder/${id}`);
  };

  const handleChangeStatus = (
    workflow: Workflow,
    newStatus: "active" | "archived"
  ) => {
    // TODO: Implement status change
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    // TODO: Implement run workflow
  };

  if (workflows.length === 0 && !showLoading) {
    return <EmptyState />;
  }

  return (
    <div className={cn("flex flex-col h-full ")}>
      <div
        className={cn("overflow-hidden flex flex-col items-center border-4")}
      >
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-rows-fr p-1 ",
            "gap-8 h-full w-full"
          )}
        >
          {showLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <WorkflowCardSkeleton key={i} />
              ))
            : workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onConfigure={() => handleConfigure(workflow.id)}
                  onChangeStatus={handleChangeStatus}
                  onRunWorkflow={handleRunWorkflow}
                />
              ))}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center justify-center border-b-2 border-slate-200 dark:border-slate-800 bg-slate-100">
        <WorkflowPagination />
      </div>
    </div>
  );
}
