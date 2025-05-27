import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { useWorkflowListState } from "./hooks/useWorkflowListState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export function WorkflowPagination() {
  const { pagination } = useFilteredWorkflows();
  const { currentPage, updateState } = useWorkflowListState();

  if (pagination.totalPages <= 1) return null;

  // Calculate the window of page numbers to show
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(pagination.totalPages, startPage + windowSize - 1);

  // Adjust the window if we're near the end
  if (endPage - startPage + 1 < windowSize) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pagination.totalPages;

  const handleNextPage = () => {
    if (!isLastPage) {
      updateState({ page: currentPage + 1 });
    }
  };

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      updateState({ page: currentPage - 1 });
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePreviousPage}
            className={cn(isFirstPage && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {pageNumbers.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => updateState({ page: pageNum })}
              isActive={pageNum === currentPage}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={handleNextPage}
            className={cn(isLastPage && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
