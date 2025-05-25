import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Workflow as WorkflowIcon } from "lucide-react";

interface WorkflowNodeCountProps {
  nodeCount: number;
}

export function WorkflowNodeCount({ nodeCount }: WorkflowNodeCountProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800",
              "text-slate-700 dark:text-slate-300"
            )}
          >
            <WorkflowIcon className="h-4 w-4" />
            {nodeCount} {nodeCount === 1 ? "Node" : "Nodes"}
          </Badge>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
}
