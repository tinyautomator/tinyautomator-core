import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { WorkflowCard, WorkflowCardSkeleton } from "./workflow-card-components";
import { useNavigation } from "react-router";
import { useDebounce } from "use-debounce";
import { EmptyState } from "./EmptyState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useWorkflowListState } from "./hooks/useWorkflowListState";
import { cn } from "@/lib/utils";
import { GRID_LAYOUT_STYLES, BORDER_STYLES } from "./utils/library.styles";

function WorkflowPagination() {
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
    (_, i) => startPage + i
  );

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pagination.totalPages;

  return (
    <Pagination>
      <PaginationContent className="select-none">
        <PaginationItem>
          <PaginationPrevious
            onClick={() =>
              !isFirstPage && updateState({ page: currentPage - 1 })
            }
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
            onClick={() =>
              !isLastPage && updateState({ page: currentPage + 1 })
            }
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

  const [showLoading] = useDebounce(navigation.state !== "idle", 150);

  if (workflows.length === 0 && !showLoading) {
    return <EmptyState />;
  }

  return (
    <div className={cn("flex flex-col h-full")}>
      <div
        className={cn("overflow-hidden flex flex-col items-center border-4")}
      >
        <div className={GRID_LAYOUT_STYLES}>
          {showLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <WorkflowCardSkeleton key={i} />
              ))
            : workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
        </div>
      </div>
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center",
          BORDER_STYLES,
          "bg-slate-100"
        )}
      >
        <WorkflowPagination />
      </div>
    </div>
  );
}
