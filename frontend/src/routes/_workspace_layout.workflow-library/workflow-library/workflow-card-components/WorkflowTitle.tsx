import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { TEXT_SLATE_DARK_SLATE_200 } from "./workflow-card.constants";

interface WorkflowTitleProps {
  title: string;
  isArchived: boolean;
  onConfigure: () => void;
}

export function WorkflowTitle({
  title,
  isArchived,
  onConfigure,
}: WorkflowTitleProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-lg w-full justify-center relative"
      )}
    >
      <button
        onClick={onConfigure}
        className={cn(
          "mr-2 text-xl cursor-pointer transition-colors",
          "text-slate-400 hover:text-yellow-400 absolute left-0 top-0"
        )}
      >
        <Star />
      </button>
      <h3
        className={cn(
          "font-bold text-md line-clamp-1 overflow-hidden text-ellipsis leading-tight",
          "group-hover:text-blue-600",
          "border-slate-200 dark:border-slate-800",
          isArchived
            ? "text-slate-500 dark:text-slate-400"
            : TEXT_SLATE_DARK_SLATE_200
        )}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}
