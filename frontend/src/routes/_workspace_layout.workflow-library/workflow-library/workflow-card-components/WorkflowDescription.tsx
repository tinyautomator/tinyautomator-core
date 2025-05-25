import { cn } from "@/lib/utils";
import { GROUP_HOVER_OPACITY_FULL } from "./workflow-card.constants";

interface WorkflowDescriptionProps {
  description?: string;
}

export function WorkflowDescription({ description }: WorkflowDescriptionProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center z-20 min-h-0",
        GROUP_HOVER_OPACITY_FULL,
        "pointer-events-none"
      )}
    >
      <p
        className={cn(
          "w-3/4 mx-auto",
          "text-xs line-clamp-3 text-center font-normal drop-shadow-sm",
          "text-slate-700 dark:text-slate-200"
        )}
      >
        {description || "No description provided"}
      </p>
    </div>
  );
}
