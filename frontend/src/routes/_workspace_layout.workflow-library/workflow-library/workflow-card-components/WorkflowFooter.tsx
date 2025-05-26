import { cn } from "@/lib/utils";
import { TEXT_SLATE_500_DARK_SLATE_400 } from "./workflow-card.styles";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WorkflowFooterProps {
  lastEdited: Date;
}

export function WorkflowFooter({ lastEdited }: WorkflowFooterProps) {
  const timeAgo = formatDistanceToNow(lastEdited, { addSuffix: true }).replace(
    /^about /,
    ""
  );

  return (
    <div
      className={cn(
        "flex items-center text-xs truncate",
        TEXT_SLATE_500_DARK_SLATE_400
      )}
    >
      <Clock className="h-3.5 w-3.5 mr-1.5" />
      <span>Updated {timeAgo}</span>
    </div>
  );
}
