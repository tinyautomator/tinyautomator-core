import { Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CounterProps {
  count: number;
  className?: string;
}

// TODO: Style the number
// TODO: Can rename to a geeeral counter will be using in tag counts as well...

export function Counter({ count, className = "" }: CounterProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs font-normal bg-transparent border border-slate-200 dark:border-slate-700",
        className
      )}
    >
      {count}
    </Badge>
  );
}

export function NodeCounter({ count, className = "" }: CounterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Box className="h-3.5 w-3.5 text-slate-400" />

      <span
        className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}
      >
        {count} nodes
      </span>
    </div>
  );
}
