import { useState } from "react";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { WorkflowCard } from "./WorkflowCard";
import { DeleteWorkflowDialog } from "./DeleteWorkflowDialog";
import { useNavigate } from "react-router";
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

function WorkflowPagination() {
  const { pagination } = useFilteredWorkflows();
  const [, updateParams] = useValidatedSearchParams();

  if (pagination.totalPages <= 1) return null;

  // Calculate the window of page numbers to show
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, pagination.currentPage - halfWindow);
  let endPage = Math.min(pagination.totalPages, startPage + windowSize - 1);

  // Adjust the window if we're near the end
  if (endPage - startPage + 1 < windowSize) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  return (
    <Pagination className="py-4 border-t border-slate-200 dark:border-slate-800">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() =>
              pagination.hasPrevPage &&
              handlePageChange(pagination.currentPage - 1)
            }
            aria-disabled={!pagination.hasPrevPage}
            className={
              !pagination.hasPrevPage
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {pageNumbers.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => handlePageChange(pageNum)}
              isActive={pagination.currentPage === pageNum}
              className="cursor-pointer"
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() =>
              pagination.hasNextPage &&
              handlePageChange(pagination.currentPage + 1)
            }
            aria-disabled={!pagination.hasNextPage}
            className={
              !pagination.hasNextPage
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function WorkflowList() {
  const { workflows } = useFilteredWorkflows();
  const navigate = useNavigate();
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(
    null
  );

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

  if (workflows.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onConfigure={() => handleConfigure(workflow.id)}
            onDelete={() => handleDelete(workflow)}
            onChangeStatus={handleChangeStatus}
          />
        ))}
      </div>

      <WorkflowPagination />

      <DeleteWorkflowDialog
        workflow={workflowToDelete}
        open={!!workflowToDelete}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
