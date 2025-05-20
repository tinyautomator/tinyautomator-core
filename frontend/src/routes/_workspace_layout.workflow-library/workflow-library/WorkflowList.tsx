import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { WorkflowCard } from "./WorkflowCard";
import { WorkflowCardSkeleton } from "./WorkflowCardSkeleton";
import { DeleteWorkflowDialog } from "./DeleteWorkflowDialog";
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
  const [workflowToDelete, setWorkflowToDelete] =
    useOptimisticParamValue<Workflow | null>(null);

  // Debounce the loading state by 150ms to prevent flash
  const [showLoading] = useDebounce(navigation.state !== "idle", 150);

  const handleDelete = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
  };

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;
    // TODO: Implement delete API call
    console.log("Deleting workflow:", workflowToDelete.id);
    setWorkflowToDelete(null);
  };

  const handleConfigure = (id: number) => {
    navigate(`/workflow-builder/${id}`);
  };

  const handleChangeStatus = (
    workflow: Workflow,
    newStatus: "active" | "archived"
  ) => {
    console.log(`Changing status of workflow ${workflow.id} to ${newStatus}`);
    // TODO: Implement status change
  };

  if (workflows.length === 0 && !showLoading) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 p-3 h-[calc(100%-5rem)]">
        {showLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <WorkflowCardSkeleton key={index} />
            ))
          : workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onConfigure={() => handleConfigure(workflow.id)}
                onDelete={() => handleDelete(workflow)}
                onChangeStatus={handleChangeStatus}
              />
            ))}
      </div>

      <div className="h-20 flex items-center justify-center pt-6">
        <WorkflowPagination />
      </div>

      <DeleteWorkflowDialog
        workflow={workflowToDelete}
        open={!!workflowToDelete}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
