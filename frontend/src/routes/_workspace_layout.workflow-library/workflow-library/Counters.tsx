import { Box } from "lucide-react";

interface CounterProps {
  count: number;
  className?: string;
}

// TODO: Style the number
// TODO: Can rename to a geeeral counter will be using in tag counts as well...

export function TabCounter({ count, className = "" }: CounterProps) {
  return (
    <span className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      {count}
    </span>
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
